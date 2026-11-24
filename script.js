// Preload initial Indian user data and default donations if empty
if (!localStorage.getItem('willingness_users')) {
  const initialUsers = [
    { name: "Aarav Sharma", email: "aarav.sharma@gmail.com", password: "password123", role: "user" },
    { name: "Priya Patel", email: "priya.patel@gmail.com", password: "password123", role: "user" },
    { name: "Admin Officer", email: "admin@willingness.org", password: "admin123", role: "admin" }
  ];
  localStorage.setItem('willingness_users', JSON.stringify(initialUsers));
}

if (!localStorage.getItem('willingness_donations')) {
  const initialDonations = [
    { txId: "TXN984123", name: "Aarav Sharma", cause: "Mission Every Girl in School", amount: "₹1,080", mode: "UPI", date: "2026-09-22" },
    { name: "Priya Patel", txId: "TXN984456", cause: "Bihar Flood Relief", amount: "₹650", mode: "Card", date: "2026-09-22" }
  ];
  localStorage.setItem('willingness_donations', JSON.stringify(initialDonations));
}

if (!localStorage.getItem('willingness_custom_campaigns')) {
  localStorage.setItem('willingness_custom_campaigns', JSON.stringify([]));
}

let currentDonationData = {
  cause: "Mission Every Girl in School",
  amount: 1000,
  tip: 80,
  total: 1080,
  mode: "UPI"
};

function openModal(id) {
  document.getElementById(id).style.display = 'flex';
}
function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

function toggleAuthMode(isSignup) {
  document.getElementById('loginForm').style.display = isSignup ? 'none' : 'block';
  document.getElementById('signupForm').style.display = isSignup ? 'block' : 'none';
  document.getElementById('modalTitle').innerText = isSignup ? 'Create Account' : 'Login to Willingness';
}

function handleSignup() {
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value.trim();
  const role = document.getElementById('signupRole').value;

  if (!name || !email || !password) {
    alert("Please fill in all fields.");
    return;
  }

  let users = JSON.parse(localStorage.getItem('willingness_users'));
  if (users.some(u => u.email === email)) {
    alert("Email already registered!");
    return;
  }

  users.push({ name, email, password, role });
  localStorage.setItem('willingness_users', JSON.stringify(users));
  alert("Registration successful! Please login.");
  toggleAuthMode(false);
}

function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  let users = JSON.parse(localStorage.getItem('willingness_users'));
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    alert("Invalid email or password!");
    return;
  }

  localStorage.setItem('willingness_logged_in', JSON.stringify(user));
  redirectUserRole(user);
}

function redirectUserRole(user) {
  if (user.role === 'admin') {
    window.location.href = 'admin.html';
  } else {
    window.location.href = 'user.html';
  }
}

function handleLogout() {
  localStorage.removeItem('willingness_logged_in');
  window.location.href = 'index.html';
}

function checkAuthAndDonate(causeName) {
  const loggedUser = JSON.parse(localStorage.getItem('willingness_logged_in'));
  if (!loggedUser) {
    alert("Please log in or register first to make a donation.");
    openModal('authModal');
    return;
  }
  localStorage.setItem('willingness_selected_cause', causeName);
  window.location.href = 'user.html';
}

window.onload = function() {
  const loggedUser = JSON.parse(localStorage.getItem('willingness_logged_in'));
  
  if (document.getElementById('welcomeUser') && loggedUser) {
    document.getElementById('welcomeUser').innerText = `Welcome, ${loggedUser.name}`;
    document.getElementById('donorName').value = loggedUser.name;
    document.getElementById('donorEmail').value = loggedUser.email;
  }

  if (document.getElementById('adminWelcomeUser') && loggedUser) {
    document.getElementById('adminWelcomeUser').innerText = `Admin: ${loggedUser.name}`;
    loadAdminDashboard();
  }

  if (document.getElementById('homeTotalRaised')) {
    loadHomeStatsAndCampaigns();
  }

  const selectedCause = localStorage.getItem('willingness_selected_cause');
  if (selectedCause && document.getElementById('summaryCauseTitle')) {
    document.getElementById('summaryCauseTitle').innerText = selectedCause;
  }
}

function getCampaignStats(causeName, targetGoal = 50000) {
  let donations = JSON.parse(localStorage.getItem('willingness_donations')) || [];
  let causeDonations = donations.filter(d => d.cause.toLowerCase().trim() === causeName.toLowerCase().trim());
  
  let raised = causeDonations.reduce((acc, curr) => {
    let cleanVal = parseInt(curr.amount.replace(/[^\d]/g, '')) || 0;
    return acc + cleanVal;
  }, 0);

  raised += 12000; 
  let donorsCount = causeDonations.length + 14;
  let percent = Math.min(Math.round((raised / targetGoal) * 100), 100);
  return { raised, donorsCount, percent };
}

function loadHomeStatsAndCampaigns() {
  let donations = JSON.parse(localStorage.getItem('willingness_donations')) || [];
  let totalSum = donations.reduce((acc, curr) => {
    let cleanVal = parseInt(curr.amount.replace(/[^\d]/g, '')) || 0;
    return acc + cleanVal;
  }, 0);

  document.getElementById('homeTotalRaised').innerText = `₹${(totalSum + 150000).toLocaleString()}`;
  document.getElementById('homeTotalDonors').innerText = donations.length + 1240;

  for (let i = 1; i <= 10; i++) {
    let titleElement = document.getElementById(`causeTitle_${i}`);
    if (titleElement) {
      let cName = titleElement.innerText.trim();
      let stats = getCampaignStats(cName, 50000);
      document.getElementById(`raised_${i}`).innerText = `₹${stats.raised.toLocaleString()}`;
      document.getElementById(`donors_${i}`).innerText = `${stats.donorsCount} Donors`;
      document.getElementById(`percent_${i}`).innerText = `${stats.percent}%`;
      document.getElementById(`bar_${i}`).style.width = `${stats.percent}%`;
    }
  }

  let customCampaigns = JSON.parse(localStorage.getItem('willingness_custom_campaigns')) || [];
  const container = document.getElementById('adminCustomCausesContainer');
  if (container && customCampaigns.length > 0) {
    container.innerHTML = customCampaigns.map((c) => {
      let stats = getCampaignStats(c.title, parseInt(c.targetAmount) || 50000);
      return `
        <div class="cause-card">
          <img src="${c.image}" alt="Campaign">
          <div class="cause-info">
            <div>
              <span style="background:#fef3c7; color:#b45309; font-size:11px; padding:2px 6px; border-radius:4px; font-weight:bold;">Admin Campaign</span>
              <h3 style="margin-top:5px;">${c.title}</h3>
              <p style="font-size: 13px; color: #666; margin-bottom: 8px;">${c.desc}</p>
              
              <div class="progress-container">
                <div class="cause-stats-row">
                  <span>Raised: <b>₹${stats.raised.toLocaleString()}</b></span>
                  <span><b>${stats.donorsCount}</b> Donors</span>
                </div>
                <div class="cause-stats-row">
                  <span>Progress</span>
                  <span><b>${stats.percent}%</b></span>
                </div>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill" style="width: ${stats.percent}%;"></div>
                </div>
              </div>
            </div>
            <button class="btn-primary" onclick="checkAuthAndDonate('${c.title}')">Donate Now</button>
          </div>
        </div>
      `;
    }).join('');
  }
}

function handleCreateCampaign(event) {
  event.preventDefault();
  const title = document.getElementById('campTitle').value.trim();
  const desc = document.getElementById('campDesc').value.trim();
  const targetAmount = document.getElementById('campAmount').value.trim();
  const image = document.getElementById('campImage').value.trim() || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&q=80';

  if (!title || !desc || !targetAmount) {
    alert("Please fill in all required campaign fields.");
    return;
  }

  let customCampaigns = JSON.parse(localStorage.getItem('willingness_custom_campaigns')) || [];
  customCampaigns.push({ title, desc, targetAmount, image });
  localStorage.setItem('willingness_custom_campaigns', JSON.stringify(customCampaigns));

  alert("Campaign successfully created and published to the Home Screen!");
  document.getElementById('campaignForm').reset();
  loadAdminDashboard();
}

function setAmount(amt, btnElement) {
  document.querySelectorAll('.checkout-container .pay-option').forEach(el => el.classList.remove('active'));
  if(btnElement) btnElement.classList.add('active');
  document.getElementById('customAmount').value = '';
  calculateTotals(amt);
}

function updateCustomAmount(input) {
  const amt = parseFloat(input.value);
  if (!isNaN(amt) && amt > 0) {
    document.querySelectorAll('.checkout-container .pay-option').forEach(el => el.classList.remove('active'));
    calculateTotals(amt);
  }
}

function calculateTotals(baseAmt) {
  currentDonationData.amount = baseAmt;
  currentDonationData.tip = Math.round(baseAmt * 0.08);
  currentDonationData.total = currentDonationData.amount + currentDonationData.tip;

  document.getElementById('summaryAmtDisplay').innerText = `₹${currentDonationData.amount.toLocaleString()}`;
  document.getElementById('summaryTipDisplay').innerText = `₹${currentDonationData.tip.toLocaleString()}`;
  document.getElementById('summaryTotalDisplay').innerText = `₹${currentDonationData.total.toLocaleString()}`;
}

function selectPaymentMethod(mode, element) {
  document.querySelectorAll('.payment-methods-grid .pay-option').forEach(el => el.classList.remove('active'));
  element.classList.add('active');
  currentDonationData.mode = mode;

  const container = document.getElementById('paymentDetailsContainer');
  if (mode === 'UPI') {
    container.innerHTML = `<div class="form-group"><label>Enter UPI ID / VPA</label><input type="text" id="upiIdInput" placeholder="e.g. name@paytm"></div>`;
  } else if (mode === 'Card') {
    container.innerHTML = `<div class="form-group"><label>Card Number</label><input type="text" placeholder="4111 2222 3333 4444"></div><div style="display:flex; gap:10px;"><input type="text" placeholder="MM/YY"><input type="password" placeholder="CVV"></div>`;
  } else {
    container.innerHTML = `<div class="form-group"><label>Select Bank</label><select style="width:100%; padding:10px;"><option>State Bank of India (SBI)</option><option>HDFC Bank</option><option>ICICI Bank</option></select></div>`;
  }
}

function triggerOtpStep() {
  const name = document.getElementById('donorName').value;
  const phone = document.getElementById('donorPhone').value;
  if (!name || !phone) {
    alert("Please fill in your name and phone number.");
    return;
  }
  openModal('otpModal');
}

function verifyOtpAndComplete() {
  const otpVal = document.getElementById('otpInputBox').value.trim();
  if (otpVal.length === 0) {
    alert("Please enter the verification OTP sent to your phone.");
    return;
  }

  closeModal('otpModal');

  const txId = 'TXN' + Math.floor(100000 + Math.random() * 900000);
  const newDonation = {
    txId: txId,
    name: document.getElementById('donorName').value,
    cause: document.getElementById('summaryCauseTitle').innerText,
    amount: `₹${currentDonationData.total.toLocaleString()}`,
    mode: currentDonationData.mode,
    date: new Date().toISOString().split('T')[0]
  };

  let donations = JSON.parse(localStorage.getItem('willingness_donations')) || [];
  donations.unshift(newDonation);
  localStorage.setItem('willingness_donations', JSON.stringify(donations));

  document.getElementById('receiptBox').innerHTML = `
    <b>Transaction ID:</b> ${txId}<br>
    <b>Donor Name:</b> ${newDonation.name}<br>
    <b>Cause:</b> ${newDonation.cause}<br>
    <b>Paid Amount:</b> ${newDonation.amount}<br>
    <b>Mode:</b> ${newDonation.mode} (Verified via OTP)
  `;
  openModal('successModal');
}

function loadAdminDashboard() {
  let donations = JSON.parse(localStorage.getItem('willingness_donations')) || [];
  let users = JSON.parse(localStorage.getItem('willingness_users')) || [];

  let totalSum = donations.reduce((acc, curr) => {
    let cleanVal = parseInt(curr.amount.replace(/[^\d]/g, '')) || 0;
    return acc + cleanVal;
  }, 0);

  document.getElementById('totalFundsMetric').innerText = `₹${totalSum.toLocaleString()}`;
  document.getElementById('totalDonorsMetric').innerText = users.filter(u => u.role === 'user').length;

  const tbody = document.getElementById('adminDonationTableBody');
  if (tbody) {
    tbody.innerHTML = donations.map(d => `
      <tr>
        <td>${d.txId}</td>
        <td>${d.name}</td>
        <td>${d.cause}</td>
        <td>${d.amount}</td>
        <td>${d.mode}</td>
        <td>${d.date}</td>
      </tr>
    `).join('');
  }
}