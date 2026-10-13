import { useEffect, useState } from "react";
import { api } from "../api";
import Pagination from "../components/Pagination";

const LIMIT = 10;
const interestsFromText = (text) => [
  ...new Set(
    text
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  ),
];

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createError, setCreateError] = useState("");
  const [editError, setEditError] = useState("");
  const [rowErrors, setRowErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    interests: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [editUser, setEditUser] = useState({
    name: "",
    role: "user",
    interests: "",
    password: "",
  });

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api(`/api/admin/users?page=${page}&limit=${LIMIT}`)
      .then(({ data, pagination }) => {
        if (!active) return;
        if (page > 1 && page > pagination.totalPages) {
          setPage(Math.max(1, pagination.totalPages));
          return;
        }
        setUsers(data);
        setPagination(pagination);
      })
      .catch((error) => {
        if (active) setError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, reload]);

  async function create(event) {
    event.preventDefault();
    setSaving(true);
    setCreateError("");
    try {
      await api("/api/admin/users", {
        method: "POST",
        body: { ...newUser, interests: interestsFromText(newUser.interests) },
      });
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "user",
        interests: "",
      });
      setPage(1);
      setReload((value) => value + 1);
    } catch (error) {
      setCreateError(error.message);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(user) {
    setEditingId(user._id);
    setEditUser({
      name: user.name,
      role: user.role,
      interests: user.interests.join(", "),
      password: "",
    });
    setEditError("");
  }

  async function update(event) {
    event.preventDefault();
    setSaving(true);
    setEditError("");
    const body = {
      name: editUser.name,
      role: editUser.role,
      interests: interestsFromText(editUser.interests),
    };
    if (editUser.password) body.password = editUser.password;
    try {
      await api(`/api/admin/users/${editingId}`, { method: "PATCH", body });
      setEditingId(null);
      setReload((value) => value + 1);
    } catch (error) {
      setEditError(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(user) {
    if (
      !window.confirm(
        `Delete ${user.name}? Their notes and posts will also be deleted.`,
      )
    )
      return;
    setSaving(true);
    setRowErrors((current) => ({ ...current, [user._id]: "" }));
    try {
      await api(`/api/admin/users/${user._id}`, { method: "DELETE" });
      if (editingId === user._id) setEditingId(null);
      setReload((value) => value + 1);
    } catch (error) {
      setRowErrors((current) => ({ ...current, [user._id]: error.message }));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main>
      <h1>Users</h1>
      <h2>Create user</h2>
      <form onSubmit={create}>
        <label>
          Name{" "}
          <input
            required
            value={newUser.name}
            onChange={(event) =>
              setNewUser({ ...newUser, name: event.target.value })
            }
          />
        </label>
        <label>
          Email{" "}
          <input
            type="email"
            required
            value={newUser.email}
            onChange={(event) =>
              setNewUser({ ...newUser, email: event.target.value })
            }
          />
        </label>
        <label>
          Password{" "}
          <input
            type="password"
            minLength="8"
            required
            value={newUser.password}
            onChange={(event) =>
              setNewUser({ ...newUser, password: event.target.value })
            }
          />
        </label>
        <label>
          Role{" "}
          <select
            value={newUser.role}
            onChange={(event) =>
              setNewUser({ ...newUser, role: event.target.value })
            }
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <label>
          Interests (comma separated){" "}
          <input
            value={newUser.interests}
            onChange={(event) =>
              setNewUser({ ...newUser, interests: event.target.value })
            }
          />
        </label>
        <button className="primary" disabled={saving}>
          {saving ? "Saving..." : "Create user"}
        </button>
        {createError && (
          <p role="alert" className="error">
            {createError}
          </p>
        )}
      </form>
      <h2>All users</h2>
      {loading && <p className="loading">Loading users...</p>}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {!loading && !error && (
        <>
          {users.length === 0 && <p>No users found.</p>}
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Interests</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.interests.join(", ") || "—"}</td>
                    <td>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => startEdit(user)}
                      >
                        Edit
                      </button>{" "}
                      <button
                        className="danger"
                        type="button"
                        disabled={saving}
                        onClick={() => remove(user)}
                      >
                        Delete
                      </button>
                      {rowErrors[user._id] && (
                        <p role="alert" className="error">
                          {rowErrors[user._id]}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination && (
            <Pagination
              page={page}
              totalPages={pagination.totalPages}
              disabled={saving}
              onPageChange={setPage}
            />
          )}
        </>
      )}
      {editingId && (
        <>
          <h2>Edit user</h2>
          <form onSubmit={update}>
            <label>
              Name{" "}
              <input
                required
                value={editUser.name}
                onChange={(event) =>
                  setEditUser({ ...editUser, name: event.target.value })
                }
              />
            </label>
            <label>
              Role{" "}
              <select
                value={editUser.role}
                onChange={(event) =>
                  setEditUser({ ...editUser, role: event.target.value })
                }
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <label>
              Interests (comma separated){" "}
              <input
                value={editUser.interests}
                onChange={(event) =>
                  setEditUser({ ...editUser, interests: event.target.value })
                }
              />
            </label>
            <label>
              New password (optional){" "}
              <input
                type="password"
                minLength="8"
                value={editUser.password}
                onChange={(event) =>
                  setEditUser({ ...editUser, password: event.target.value })
                }
              />
            </label>
            <div>
              <button className="primary" disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </button>{" "}
              <button
                type="button"
                disabled={saving}
                onClick={() => setEditingId(null)}
              >
                Cancel
              </button>
            </div>
            {editError && (
              <p role="alert" className="error">
                {editError}
              </p>
            )}
          </form>
        </>
      )}
    </main>
  );
}
