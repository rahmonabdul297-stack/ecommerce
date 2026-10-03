import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LogOut,
  UserRound,
  Camera,
  ShieldCheck,
  MapPin,
  Package,
  Pencil,
  X,
  Check,
} from "lucide-react";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { signOut } from "@/services/authService";
import {
  getMyProfile,
  updateMyProfile,
  type UserProfile,
} from "@/services/profileService";

const emptyProfile: UserProfile = {
  name: "",
  username: "",
  email: "",
  phone: "",
  date: "",
  bio: "",
  profileImage: "",
  addresses: [],
};


export function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [originalProfile, setOriginalProfile] =
    useState<UserProfile>(emptyProfile);
  console.log(profile.addresses)
  // Facebook-style inline editing states
  const [editingField, setEditingField] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = (await getMyProfile()) as any;
      // Extract user object safely whether wrapped in { user: { ... } } or returned directly
      const userData = response?.user || response;
      setProfile(userData);
      setOriginalProfile(userData);
      setImagePreview(userData.profileImage || null);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Could not load your profile.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const updateField = (key: keyof UserProfile, value: string) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const handleImageChange = (file: File | null) => {
    setImage(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      void handleQuickSave("Profile Picture", file);
    }
  };

  // Facebook-style quick save for individual fields or avatar uploads
  const handleQuickSave = async (
    changedLabel?: string,
    fileOverride?: File,
  ) => {
    setSaving(true);
    setNotice(null);
    try {
      const form = new FormData();
      for (const key of [
        "name",
        "username",
        "email",
        "phone",
        "bio",
      ] as const) {
        const value = profile[key];
        if (value) form.append(key, value);
      }
      if (newPassword) form.append("password", newPassword);
      const fileToUpload = fileOverride || image;
      if (fileToUpload) form.append("image", fileToUpload);

      const response = (await updateMyProfile(form)) as any;
      const updatedUserData = response?.user || response;
      setProfile(updatedUserData);
      setOriginalProfile(updatedUserData);
      if (updatedUserData.profileImage)
        setImagePreview(updatedUserData.profileImage);
      setImage(null);
      setNewPassword("");
      setEditingField(null);
      setNotice(
        changedLabel
          ? `${changedLabel} updated successfully.`
          : "Profile updated successfully.",
      );
    } catch (reason) {
      setNotice(
        reason instanceof Error
          ? reason.message
          : "Could not update your profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = (key: keyof UserProfile) => {
    setProfile((current) => ({ ...current, [key]: originalProfile[key] }));
    setEditingField(null);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } catch (reason) {
      console.warn("Backend signout notice:", reason);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      navigate("/", { replace: true });
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <StorefrontLayout>
        <div className="mx-auto max-w-4xl px-4 py-16">
          <FullPageSpinner message="Loading your account details…" />
        </div>
      </StorefrontLayout>
    );
  }

  if (error) {
    return (
      <StorefrontLayout>
        <div className="mx-auto max-w-4xl px-4 py-16">
          <ErrorState message={error} onRetry={loadProfile} />
          <div className="mt-6 text-center text-sm text-stone-600">
            Need to sign in?{" "}
            <Link className="font-semibold text-teal-600 underline" to="/auth">
              Go to your account
            </Link>
          </div>
        </div>
      </StorefrontLayout>
    );
  }

  const renderFieldRow = (
    label: string,
    valueKey: "name" | "username" | "email" | "phone",
    type = "text",
    placeholder = "",
  ) => {
    const isEditing = editingField === valueKey;
    const displayValue = profile[valueKey] || "Not provided";

    return (
      <div className="flex items-center justify-between py-4 border-b border-stone-100 last:border-0">
        <div className="space-y-1 pr-4 flex-1">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
            {label}
          </span>
          {!isEditing ? (
            <p className="text-sm font-medium text-stone-900 break-words">
              {displayValue}
            </p>
          ) : (
            <div className="mt-2 flex items-center gap-2">
              <input
                type={type}
                className="w-full rounded-xl border border-teal-500 bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none"
                value={profile[valueKey] ?? ""}
                onChange={(e) => updateField(valueKey, e.target.value)}
                placeholder={placeholder}
              />
              <button
                type="button"
                onClick={() => handleQuickSave(label)}
                disabled={saving}
                className="p-2 rounded-xl bg-teal-600 text-white hover:bg-teal-500 transition-colors shrink-0"
                title="Save"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => cancelEdit(valueKey)}
                className="p-2 rounded-xl bg-stone-200 text-stone-700 hover:bg-stone-300 transition-colors shrink-0"
                title="Cancel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={() => setEditingField(valueKey)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-2 rounded-xl transition-colors shrink-0"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
        )}
      </div>
    );
  };

  return (
    <StorefrontLayout>
      <main className="min-h-screen bg-stone-50/50 pb-16">
        {/* Cover Banner Header */}
        <div className="relative h-48 sm:h-64 w-full bg-gradient-to-r from-stone-900 via-teal-950 to-stone-900 overflow-hidden shadow-sm">
          <img
            src="https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=2000&q=80"
            alt="Store banner"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 to-transparent"></div>
        </div>

        {/* Profile Card & Navigation Header Section */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-20 sm:-mt-24 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-200">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
              {/* Avatar Preview */}
              <div className="relative group">
                <div className="h-32 w-32 sm:h-36 sm:w-36 rounded-2xl overflow-hidden border-4 border-white shadow-md bg-stone-100 flex items-center justify-center">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt={profile.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound className="h-14 w-14 text-stone-400" />
                  )}
                </div>
                <label
                  className="absolute bottom-2 right-2 bg-teal-600 hover:bg-teal-500 text-white p-2.5 rounded-xl shadow-lg cursor-pointer transition-transform hover:scale-105"
                  title="Change photo"
                >
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleImageChange(e.target.files?.[0] ?? null)
                    }
                  />
                </label>
              </div>

              {/* User Bio Heading */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified Customer
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                  {profile.name || "Nokata User"}
                </h1>
                <p className="text-sm text-stone-500">
                  @{profile.username || "username"}
                </p>
                {profile.date && (
                  <p className="text-xs text-stone-500">
                    Member since{" "}
                    {new Date(profile.date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                    })}
                  </p>
                )}
              </div>
            </div>

            {/* Sign Out Button */}
            <Button
              type="button"
              variant="outline"
              loading={signingOut}
              onClick={handleSignOut}
              className="rounded-xl border-stone-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
            >
              {!signingOut && <LogOut className="h-4 w-4 mr-2" />} Sign out
            </Button>
          </div>

          {notice && (
            <div
              role="status"
              className="mb-6 p-4 rounded-2xl bg-teal-50 border border-teal-200 text-sm font-medium text-teal-800"
            >
              {notice}
            </div>
          )}

          {/* Main Grid: Facebook-style Details Mapping & Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_20rem] gap-8">
            {/* Facebook-style Details Mapping Section */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-200 space-y-2">
              <div className="border-b border-stone-100 pb-4 mb-2">
                <h2 className="text-lg font-bold text-stone-900">
                  About Info & Details
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Click the edit button next to any field to update your
                  database records.
                </p>
              </div>

              {renderFieldRow(
                "Full Name",
                "name",
                "text",
                "Enter your full name",
              )}
              {renderFieldRow(
                "Username",
                "username",
                "text",
                "Enter your username",
              )}
              {renderFieldRow(
                "Email Address",
                "email",
                "email",
                "Enter your email",
              )}
              {renderFieldRow(
                "Phone Number",
                "phone",
                "tel",
                "Enter your phone number",
              )}

              {/* Bio Section */}
              <div className="py-4 border-b border-stone-100">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 pr-4 flex-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                      About You / Bio
                    </span>
                    {editingField !== "bio" ? (
                      <p className="text-sm font-medium text-stone-900 break-words mt-1">
                        {profile.bio || "No bio added yet."}
                      </p>
                    ) : (
                      <div className="mt-2 space-y-2">
                        <textarea
                          className="w-full rounded-xl border border-teal-500 bg-white p-3 text-sm text-stone-900 focus:outline-none min-h-[90px]"
                          value={profile.bio ?? ""}
                          onChange={(e) => updateField("bio", e.target.value)}
                          placeholder="Tell us a little about yourself..."
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleQuickSave("Bio")}
                            disabled={saving}
                            className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-500 transition-colors"
                          >
                            Save Bio
                          </button>
                          <button
                            type="button"
                            onClick={() => cancelEdit("bio")}
                            className="px-4 py-2 rounded-xl bg-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  {editingField !== "bio" && (
                    <button
                      type="button"
                      onClick={() => setEditingField("bio")}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-2 rounded-xl transition-colors shrink-0"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                  )}
                </div>
              </div>

              {/* Password Security Section */}
              <div className="py-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 pr-4 flex-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                      Password Security
                    </span>
                    {editingField !== "password" ? (
                      <p className="text-sm font-medium text-stone-900">
                        ••••••••••••
                      </p>
                    ) : (
                      <div className="mt-2 space-y-2">
                        <input
                          type="password"
                          className="w-full rounded-xl border border-teal-500 bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password (min 8 chars)"
                          minLength={8}
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleQuickSave("Password")}
                            disabled={saving || newPassword.length < 8}
                            className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-500 disabled:opacity-50 transition-colors"
                          >
                            Update Password
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setNewPassword("");
                              setEditingField(null);
                            }}
                            className="px-4 py-2 rounded-xl bg-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  {editingField !== "password" && (
                    <button
                      type="button"
                      onClick={() => setEditingField("password")}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-2 rounded-xl transition-colors shrink-0"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Change
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar: Shopping Quick Links & Addresses */}
            <aside className="space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                  Shopping Hub
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Manage your recent orders, shipping addresses, and saved
                  preferences.
                </p>
                <div className="space-y-2 pt-2">
                  <Link
                    to="/orders"
                    className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 hover:bg-teal-50 hover:text-teal-700 text-stone-700 text-sm font-semibold transition-colors group"
                  >
                    <div className="bg-white p-2 rounded-lg shadow-sm text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                      <Package className="h-4 w-4" />
                    </div>
                    View Your Orders
                  </Link>
                  <Link
                    to="/addresses"
                    className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 hover:bg-teal-50 hover:text-teal-700 text-stone-700 text-sm font-semibold transition-colors group"
                  >
                    <div className="bg-white p-2 rounded-lg shadow-sm text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                      <MapPin className="h-4 w-4" />
                    </div>
                    Manage Addresses
                  </Link>
                </div>

                {/* Mapped Delivery Addresses from Profile Response */}
                {profile.addresses && profile.addresses.length > 0 && (
                  <div className="border-t border-stone-100 pt-4 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                      Saved delivery addresses
                    </h4>
                    <ul className="space-y-3">
                      {profile.addresses.map((address) => (
                      
                        <li
                          key={address._id}
                          className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs leading-relaxed text-stone-600 relative space-y-1"
                        >
                          {address.isDefault && (
                            <span className="absolute top-2.5 right-2.5 bg-teal-600 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                              Default
                            </span>
                          )}
                          <p className="font-semibold text-stone-900 pr-12">
                            {address.street}
                          </p>
                          <p>
                            {[
                              address.city,
                              address.state,
                              address.postalCode,
                              address.country,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>
    </StorefrontLayout>
  );
}