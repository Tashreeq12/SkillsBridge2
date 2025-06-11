import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { getDatabase, ref, onValue, set, push } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAD37t_mlsdrtt1X7uyvSJJlappTxSC9t0",
    authDomain: "codecrussaders.firebaseapp.com",
    projectId: "codecrussaders",
    storageBucket: "codecrussaders.appspot.com",
    messagingSenderId: "806653513715",
    appId: "1:806653513715:web:d665c2f92f5acdd89dcc86"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);


// Login function
function login(email, password) {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        checkUserRole(user.uid);
      })
      .catch((error) => {
        alert("Login failed: " + error.message);
      });
}

// Register function
function register(email, password) {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const userRef = ref(db, `users/${user.uid}`);
      
      return set(userRef, { email: email, role: "student" })  // Return the promise
        .then(() => {
          alert("Registration successful! Redirecting to login...");
          setTimeout(() => {
            window.location.href = "login.html";
          }, 1000);
        });
    })
    .catch((error) => {
      console.error("Registration Error:", error);
      alert("Registration failed: " + error.message);
    });
}


// Check user role and redirect
function checkUserRole(uid) {
    const userRef = ref(db, `users/${uid}`);
    onValue(userRef, (snapshot) => {
      const userData = snapshot.val();
      if (userData && userData.role === "student") {
        window.location.href = "userDashboard.html";
      } else if (userData && userData.role === "admin") {
        window.location.href = "adminDashboard.html";
      } else {
        alert("Role not recognized. Please register or contact support.");
      }
    }, { onlyOnce: true });
}

// Export functions and Firebase instances
//end of update
export { auth, db, ref, onValue, set, push, storage, storageRef, uploadBytes, getDownloadURL, login, register, onAuthStateChanged };