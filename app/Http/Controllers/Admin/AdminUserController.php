<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class AdminUserController extends Controller
{
    public function index()
    {
        $admins = User::query()
            ->whereIn('role', User::STAFF_ROLES)
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Admins/Index', [
            'admins'               => $admins,
            'availablePermissions' => User::PERMISSIONS,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Admins/Form', [
            'admin'                => new User(['role' => 'manager', 'permissions' => []]),
            'availablePermissions' => User::PERMISSIONS,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'          => ['required', 'string', 'max:120'],
            'email'         => ['required', 'email', 'max:180', 'unique:users,email'],
            'password'      => ['required', 'confirmed', Password::defaults()],
            'role'          => ['required', Rule::in(User::STAFF_ROLES)],
            'permissions'   => ['nullable', 'array'],
            'permissions.*' => ['string'],
        ]);

        User::create([
            'name'              => $data['name'],
            'email'             => $data['email'],
            'password'          => $data['password'],
            'role'              => $data['role'],
            'permissions'       => $data['role'] === 'admin' ? null : ($data['permissions'] ?? []),
            'email_verified_at' => now(),
        ]);

        return redirect()->route('admin.admins.index')->with('status', 'Staff account created successfully.');
    }

    public function edit(User $admin)
    {
        abort_unless($admin->isAdmin(), 404);

        return Inertia::render('Admin/Admins/Form', [
            'admin'                => $admin,
            'availablePermissions' => User::PERMISSIONS,
        ]);
    }

    public function update(Request $request, User $admin)
    {
        abort_unless($admin->isAdmin(), 404);

        $data = $request->validate([
            'name'          => ['required', 'string', 'max:120'],
            'email'         => ['required', 'email', 'max:180', Rule::unique('users', 'email')->ignore($admin->id)],
            'password'      => ['nullable', 'confirmed', Password::defaults()],
            'role'          => ['required', Rule::in(User::STAFF_ROLES)],
            'permissions'   => ['nullable', 'array'],
            'permissions.*' => ['string'],
        ]);

        // Prevent last super admin from demoting themselves
        if ($admin->isSuperAdmin() && $data['role'] !== 'admin' && User::where('role', 'admin')->count() <= 1) {
            return back()->withErrors(['role' => 'At least one Super Admin account must remain.']);
        }

        $admin->name        = $data['name'];
        $admin->email       = $data['email'];
        $admin->role        = $data['role'];
        $admin->permissions = $data['role'] === 'admin' ? null : ($data['permissions'] ?? []);

        if (! empty($data['password'])) {
            $admin->password = $data['password'];
        }
        $admin->save();

        return redirect()->route('admin.admins.index')->with('status', 'Staff account updated successfully.');
    }

    public function destroy(User $admin)
    {
        abort_unless($admin->isAdmin(), 404);

        if ((int) $admin->id === (int) Auth::id()) {
            return back()->withErrors(['admin' => 'You cannot delete your own account while logged in.']);
        }

        if ($admin->isSuperAdmin() && User::where('role', 'admin')->count() <= 1) {
            return back()->withErrors(['admin' => 'At least one Super Admin account must remain.']);
        }

        $admin->delete();

        return redirect()->route('admin.admins.index')->with('status', 'Staff account deleted.');
    }

    /** Change the currently logged-in admin's password. */
    public function editPassword()
    {
        return Inertia::render('Admin/Admins/Password');
    }

    public function updatePassword(Request $request)
    {
        $data = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password'         => ['required', 'confirmed', Password::defaults()],
        ]);

        /** @var User $user */
        $user = Auth::user();
        $user->password = $data['password'];
        $user->save();

        return redirect()->route('admin.admins.index')->with('status', 'Your password was updated.');
    }
}
