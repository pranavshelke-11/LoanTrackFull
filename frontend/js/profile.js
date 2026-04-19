// =============================================
// profile.js - PROFILE PAGE (real backend)
// =============================================

document.addEventListener('DOMContentLoaded', async () => {
  await loadProfile();
});

// ===== LOAD PROFILE FROM BACKEND =====
async function loadProfile() {
  try {
    const user = await Profile.get();
    fillProfileUI(user);
  } catch (err) {
    showToast('Could not load profile: ' + err.message);
  }
}

// ===== FILL PROFILE UI WITH REAL DATA =====
function fillProfileUI(user) {
  // View mode fields
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val || '-';
  };

  const fullName = `${user.firstName} ${user.lastName}`;
  const initials = (user.firstName[0] + user.lastName[0]).toUpperCase();

  // Avatar & name
  document.querySelectorAll('.profile-avatar').forEach(el => el.textContent = initials);
  document.querySelectorAll('.avatar').forEach(el => el.textContent = initials);
  set('profileFullName', fullName);
  set('profileEmail',    user.email);
  set('profileMobile',   user.mobile);
  set('profilePAN',      user.pan);
  set('profileAadhaar',  user.aadhaar ? 'XXXX XXXX ' + user.aadhaar.slice(-4) : '-');
  set('profileCity',     user.city);
  set('profileMemberSince', 'Member since ' + formatDate(user.createdAt));

  // Edit form defaults
  setVal('editFirstName', user.firstName);
  setVal('editLastName',  user.lastName);
  setVal('editMobile',    user.mobile);
  setVal('editCity',      user.city);

  // Settings toggles
  setCheck('toggleEmail', user.emailNotifications);
  setCheck('toggleSMS',   user.smsAlerts);
  setCheck('toggle2FA',   user.twoFactorAuth);
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || '';
}

function setCheck(id, val) {
  const el = document.getElementById(id);
  if (el) el.checked = !!val;
}

// ===== TOGGLE EDIT MODE =====
function toggleEdit() {
  const viewMode = document.getElementById('viewMode');
  const editMode = document.getElementById('editMode');
  viewMode.style.display = viewMode.style.display === 'none' ? 'block' : 'none';
  editMode.style.display = editMode.style.display === 'none' ? 'block' : 'none';
}

// ===== SAVE PROFILE =====
async function saveProfile(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  try {
    const data = {
      firstName: document.getElementById('editFirstName').value,
      lastName:  document.getElementById('editLastName').value,
      mobile:    document.getElementById('editMobile').value,
      city:      document.getElementById('editCity').value
    };

    const updated = await Profile.update(data);
    // Refresh stored user info
    const stored = getUser();
    if (stored) {
      stored.firstName = data.firstName;
      stored.lastName  = data.lastName;
      stored.initials  = (data.firstName[0] + data.lastName[0]).toUpperCase();
      localStorage.setItem('lt_user', JSON.stringify(stored));
    }

    fillProfileUI(updated.user || { ...data, createdAt: new Date() });
    toggleEdit();
    showToast('Profile updated successfully!');
  } catch (err) {
    showToast('Could not update profile: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Changes';
  }
}

// ===== CHANGE PASSWORD =====
async function changePassword(e) {
  e.preventDefault();
  const btn     = e.target.querySelector('button[type="submit"]');
  const current = document.getElementById('currentPass').value;
  const newPass = document.getElementById('newPass').value;
  const confirm = document.getElementById('confirmPass').value;

  if (newPass !== confirm) {
    showToast('New passwords do not match.');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Updating...';

  try {
    await Profile.changePassword(current, newPass);
    e.target.reset();
    showToast('Password changed successfully!');
  } catch (err) {
    showToast(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Update Password';
  }
}

// ===== SAVE NOTIFICATION SETTINGS =====
async function saveSettings() {
  try {
    await Profile.update({
      emailNotifications: document.getElementById('toggleEmail').checked,
      smsAlerts:          document.getElementById('toggleSMS').checked,
      twoFactorAuth:      document.getElementById('toggle2FA').checked
    });
    showToast('Settings saved!');
  } catch (err) {
    showToast('Could not save settings: ' + err.message);
  }
}
