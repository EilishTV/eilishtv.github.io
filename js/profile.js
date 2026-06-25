import {
    getFirestore,
    collection,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    onSnapshot,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { 
    updatePassword, 
    reauthenticateWithCredential, 
    EmailAuthProvider 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { auth } from "/js/auth.js"; 

const db = getFirestore();
let unsubscribe = null;
let isFirstTime = false;
let currentProfilesCount = 0;

const ICON_CATEGORIES = {
    "Billie Eilish": [
        "https://i.pinimg.com/736x/4d/f1/0f/4df10ff74cdd7e45df822e2ff4f7344f.jpg",
        "https://i.pinimg.com/1200x/f9/1f/65/f91f65cbb59621bf297e44380e34a953.jpg",
        "https://i.pinimg.com/736x/dd/dd/13/dddd1325647878456f885e34cd494f7b.jpg",
        "https://i.pinimg.com/736x/96/79/b6/9679b6fa9f316e871c65a42fa0d66d0c.jpg",
        "https://i.pinimg.com/474x/82/58/b5/8258b53d480c981f85f0fab2093d6d41.jpg",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKyC6wyShsE7OZz51b4_yK9x2LPGtqxA-HMw&s",
        "https://preview.redd.it/new-photos-of-billie-on-instagram-v0-w5fq259pj6mf1.jpg?width=640&crop=smart&auto=webp&s=cc298e3079f8d460f8e3c52a071d9416c1f1b301",
        "https://s.yimg.com/ny/api/res/1.2/a4gWz..va9mAds8uWjqEXA--/YXBwaWQ9aGlnaGxhbmRlcjt3PTk2MDtoPTkyNTtjZj13ZWJw/https://media.zenfs.com/en/globe_458/dec12660f4393aa8f306a382b39fc52e"
    ],
        "HIT ME HARD AND SOFT: THE TOUR": [
        "https://i.pinimg.com/736x/1f/b5/2a/1fb52a9c26d77b1c6b3882a5419178e2.jpg",
        "https://i.pinimg.com/736x/06/a8/e1/06a8e1caaeefb0657038fd9b8f0c5b7e.jpg",
        "https://i.pinimg.com/736x/5f/8e/73/5f8e730b815952a7b404faefb2a252e8.jpg",
        "https://i.pinimg.com/736x/03/3a/3a/033a3a06284215100a653f1ed370e597.jpg",
    ],
    "Sudamerica Tour 2023": [
        "https://i.pinimg.com/736x/9a/c1/99/9ac1995b1621d6d10246760f70840527.jpg",
        "https://i.pinimg.com/736x/f1/a7/3e/f1a73e47ef00ba49b7ca37c261a5c974.jpg",
        "https://i.pinimg.com/736x/0b/e8/49/0be84979046d08ee35898de5f7fc6e6b.jpg"
    ]
};

// --- GESTIÓN DE PERFILES (FIRESTORE) ---

export function initProfilesUI(user) {
    const container = document.getElementById("profilesContainer");
    if (!user || !container) return;
    
    const ref = query(collection(db, "users", user.uid, "profiles"), orderBy("createdAt", "asc"));
    
    if (unsubscribe) unsubscribe();
    unsubscribe = onSnapshot(ref, (snap) => { 
        isFirstTime = snap.empty;
        currentProfilesCount = snap.size; 
        renderProfileList(snap, user, container); 
    });
}

function renderProfileList(snap, user, container) {
    const subtitle = document.getElementById("profileSubtitle");
    if (snap.empty) { showProfileForm(user); return; }

    if(subtitle) subtitle.innerText = "Profile Settings";
    container.innerHTML = "";
    
    snap.forEach((d, index) => {
        const p = d.data();
        const isMain = p.main || index === 0;

        if (isMain && window.updateNavAvatars) {
            window.updateNavAvatars(p.avatar, p.name);
        }

        const row = document.createElement("div");
        row.className = "row profile-row";
        row.innerHTML = `
            <div class="left">
                <img src="${p.avatar}" class="avatar" style="width:50px;height:50px;border-radius:4px;margin-right:15px;object-fit:cover">
                <div style="display:flex; flex-direction:column;">
                    <span style="font-size:16px; font-weight:500;">${p.name}</span>
                    ${isMain ? `<span style="font-size:10px; color:#aaa; font-weight:bold; letter-spacing:1px; margin-top:2px;">MAIN PROFILE</span>` : ''}
                </div>
            </div>
            <span class="arrow">Editar ›</span>
        `;
        row.onclick = () => showProfileForm(user, {id: d.id, ...p});
        container.appendChild(row);
    });

    if (currentProfilesCount < 5) {
        const addRow = document.createElement("div");
        addRow.className = "row profile-row";
        addRow.innerHTML = `<div class="left"><div style="width:50px;height:50px;display:flex;align-items:center;justify-content:center;background:#f2f2f2;border-radius:4px;margin-right:15px;"><i class="fas fa-plus" style="color:#666"></i></div><span>Añadir perfil</span></div><span class="arrow">›</span>`;
        addRow.onclick = () => showProfileForm(user);
        container.appendChild(addRow);
    }
}

function showProfileForm(user, profile = null) {
    const container = document.getElementById("profilesContainer");
    const subtitle = document.getElementById("profileSubtitle");
    let selectedAvatar = profile ? profile.avatar : ICON_CATEGORIES["Billie Eilish"][0];
    let tempName = profile ? profile.name : "";

    const renderForm = () => {
        subtitle.innerText = profile ? "Edit Profile" : "Create Profile";
        container.innerHTML = `
            <div id="mainForm" class="fade" style="padding: 10px 0;">
                <div style="display: flex; gap: 20px; align-items: flex-start; border-bottom: 1px solid #333; padding-bottom: 30px; margin-bottom: 20px;">
                    <div style="position: relative; width: 110px; height: 110px; cursor: pointer; border-radius: 4px; overflow: hidden;" id="openIconPicker">
                        <img id="currentAvatar" src="${selectedAvatar}" style="width: 100%; height: 100%; object-fit: cover;">
                        <div class="overlay-edit" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; opacity:1; transition:0.3s;">
                            <i class="fas fa-pencil-alt" style="color: white; font-size: 18px;"></i>
                        </div>
                    </div>
                    <div style="flex: 1;">
                        <input type="text" id="pName" value="${tempName}" placeholder="Nombre" style="width: 100%; padding: 10px; background: #eee; border: none; color: #333; font-size: 16px; border-radius: 2px; margin-bottom: 20px; outline: none;">
                        <label style="display: block; color: #a2a2a2; font-size: 14px; margin-bottom: 5px;">Language:</label>
                        <select style="background: #000; color: #fff; border: 1px solid #333; padding: 5px 10px; width: 120px; border-radius: 2px;"><option>Español</option></select>
                    </div>
                </div>

                <div style="display: flex; gap: 15px; align-items: center; width: 100%;">
                    <button id="saveBtn" style="background: #000; color: #fff; border: none; padding: 10px 25px; font-weight: bold; cursor: pointer; font-size: 12px;">SAVE</button>
                    <button id="cancelBtn" style="background: none; border: 1px solid #666; color: #666; padding: 10px 25px; font-weight: bold; cursor: pointer; font-size: 12px;">CANCEL</button>

                    ${(profile && !profile.main && currentProfilesCount > 1) ? `
                        <button id="delBtn" style="margin-left: auto; background: none; border: 1px solid #ff4444; color: #ff4444; padding: 10px 20px; font-weight: bold; cursor: pointer; font-size: 11px;">
                            <i class="fas fa-trash-alt"></i> DELETE
                        </button>
                    ` : ''}
                </div>
            </div>
        `;

        document.getElementById("openIconPicker").onclick = () => {
            tempName = document.getElementById("pName").value;
            showIconPicker();
        };

        document.getElementById("cancelBtn").onclick = () => initProfilesUI(user);

        if(document.getElementById("delBtn")) {
            document.getElementById("delBtn").onclick = async () => {
                if(confirm("¿Eliminar este perfil?")) {
                    await deleteDoc(doc(db, "users", user.uid, "profiles", profile.id));
                    initProfilesUI(user);
                }
            };
        }

        document.getElementById("saveBtn").onclick = async () => {
            const name = document.getElementById("pName").value.trim();
            if(!name) return alert("Escribe un nombre");
            
            try {
                if(profile) {
                    await updateDoc(doc(db, "users", user.uid, "profiles", profile.id), { name, avatar: selectedAvatar });

                    if (localStorage.getItem("navProfileName") === profile.name || profile.main) {
                        if (window.updateNavAvatars) window.updateNavAvatars(selectedAvatar, name);
                    }
                } else {
                    await addDoc(collection(db, "users", user.uid, "profiles"), { 
                        name, avatar: selectedAvatar, main: isFirstTime, createdAt: new Date() 
                    });
                }

                initProfilesUI(user);

                // 🔥 SOLO AGREGADO
                window.location.reload();

            } catch (err) { console.error(err); }
        };
    };

    const showIconPicker = () => {
        subtitle.innerText = "Choose your Icon";
        container.innerHTML = `<div class="fade" style="color: white; padding-top: 10px;"><div id="categoriesList"></div><button id="backToForm" style="margin-top:20px; background:none; border:1px solid #444; color:#888; padding:8px 15px; cursor:pointer; font-size:12px; border-radius:2px;">BACK</button></div>`;
        Object.entries(ICON_CATEGORIES).forEach(([catName, icons]) => {
            const section = document.createElement("div");
            section.style = "margin-bottom: 25px;";
            section.innerHTML = `
                <h3 style="font-size:13px; color:#666; margin-bottom:10px; text-transform: uppercase;">${catName}</h3>
                <div class="icon-row" style="display:flex; gap:10px; overflow-x:auto;">
                    ${icons.map(url => `<img src="${url}" class="icon-choice" style="width:80px; height:80px; object-fit:cover; border-radius:4px; cursor:pointer; border: 2px solid transparent;">`).join('')}
                </div>`;
            document.getElementById("categoriesList").appendChild(section);
        });

        document.querySelectorAll(".icon-choice").forEach(img => {
            img.onclick = () => { selectedAvatar = img.src; renderForm(); };
        });

        document.getElementById("backToForm").onclick = () => renderForm();
    };

    renderForm();
}

// resto igual...
window.initProfilesUI = initProfilesUI;
// --- GESTIÓN DE SEGURIDAD (AUTH) ---

window.showPasswordForm = () => {
    document.getElementById("passwordSection").style.display = "none";
    document.getElementById("passwordFormContainer").style.display = "block";
};

window.hidePasswordForm = () => {
    document.getElementById("passwordSection").style.display = "block";
    document.getElementById("passwordFormContainer").style.display = "none";
};

document.addEventListener('click', async (e) => {
    if (e.target.id === 'updatePassBtn') {
        const user = auth.currentUser;
        const currentPass = document.getElementById("currentPassword").value;
        const newPass = document.getElementById("newPassword").value;
        const confirmPass = document.getElementById("confirmPassword").value;
        const msg = document.getElementById("passMessage");

        if (!currentPass || !newPass) return alert("Completa los campos");
        if (newPass !== confirmPass) {
            msg.style.color = "#ff4444";
            msg.innerText = "Las contraseñas no coinciden.";
            return;
        }

        msg.innerText = "Procesando...";
        try {
            const credential = EmailAuthProvider.credential(user.email, currentPass);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPass);
            msg.style.color = "#2ecc71";
            msg.innerText = "¡Contraseña actualizada!";
            setTimeout(() => window.hidePasswordForm(), 2000);
        } catch (error) {
            msg.style.color = "#ff4444";
            msg.innerText = "Error: Verifica tu contraseña actual.";
        }
    }
});

window.initProfilesUI = initProfilesUI;

