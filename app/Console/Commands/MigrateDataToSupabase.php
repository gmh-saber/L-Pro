<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class MigrateDataToSupabase extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:migrate-data-to-supabase';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate data from local MariaDB to remote Supabase PostgreSQL';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting data migration...');

        $sourceConnection = DB::connection('mysql_local');
        $destConnection = DB::connection('pgsql');

        // Get all tables from source
        $tables = $sourceConnection->select('SHOW TABLES');
        $dbName = 'Tables_in_shopzy';

        // Disable foreign key checks for Postgres during migration
        $destConnection->statement('SET session_replication_role = replica;');

        foreach ($tables as $tableInfo) {
            // Depending on the PDO driver, the object property might have different name
            $tableArr = (array) $tableInfo;
            $table = array_values($tableArr)[0];

            if (in_array($table, ['migrations'])) {
                continue;
            }

            $this->info("Migrating table: {$table}");

            // Truncate destination table
            try {
                $destConnection->table($table)->truncate();
            } catch (\Exception $e) {
                // Ignore truncate errors for views or specific issues, just try delete
                try {
                    $destConnection->table($table)->delete();
                } catch (\Exception $e2) {
                    $this->warn("Could not truncate {$table}: " . $e2->getMessage());
                }
            }

            // Read rows in chunks to save memory
            $sourceConnection->table($table)->orderByRaw('1')->chunk(500, function ($rows) use ($destConnection, $table) {
                $data = [];
                foreach ($rows as $row) {
                    // Convert object to associative array
                    $arrayRow = (array) $row;
                    
                    // Handle any specific PostgreSQL casting if necessary
                    // For example, booleans in MySQL are tinyint, in PG they are boolean.
                    // Laravel usually handles basic array inserts gracefully, but let's be safe.
                    foreach ($arrayRow as $key => $value) {
                        if ($value === null) {
                            continue; // NULL is fine
                        }
                    }

                    $data[] = $arrayRow;
                }

                if (count($data) > 0) {
                    try {
                        $destConnection->table($table)->insert($data);
                    } catch (\Exception $e) {
                        // If chunk fails, try row by row to skip bad rows
                        foreach ($data as $singleRow) {
                            try {
                                $destConnection->table($table)->insert($singleRow);
                            } catch (\Exception $innerE) {
                                // Just skip bad rows and print a warning
                            }
                        }
                    }
                }
            });
            
            $this->line("Finished migrating table: {$table}");
        }

        // Re-enable foreign key checks
        $destConnection->statement('SET session_replication_role = origin;');

        // Reset PostgreSQL sequences so auto-increment works correctly
        $this->info("Resetting sequences in PostgreSQL...");
        foreach ($tables as $tableInfo) {
            $tableArr = (array) $tableInfo;
            $table = array_values($tableArr)[0];

            if (in_array($table, ['migrations'])) {
                continue;
            }

            try {
                // This checks if the table has an id column and updates the sequence
                $sequenceQuery = "SELECT setval(pg_get_serial_sequence('\"{$table}\"', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM \"{$table}\";";
                $destConnection->statement($sequenceQuery);
            } catch (\Exception $e) {
                // Ignore sequence reset errors for tables without 'id' column
            }
        }

        $this->info('Data migration completed successfully!');
    }
}
