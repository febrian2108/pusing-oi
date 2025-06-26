var B=Object.defineProperty;var I=(c,e,t)=>e in c?B(c,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):c[e]=t;var f=(c,e,t)=>I(c,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))i(a);new MutationObserver(a=>{for(const o of a)if(o.type==="childList")for(const r of o.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function t(a){const o={};return a.integrity&&(o.integrity=a.integrity),a.referrerPolicy&&(o.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?o.credentials="include":a.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(a){if(a.ep)return;a.ep=!0;const o=t(a);fetch(a.href,o)}})();window.addEventListener("online",()=>{document.getElementById("offline-indicator").classList.remove("show")});window.addEventListener("offline",()=>{document.getElementById("offline-indicator").classList.add("show")});let v;window.addEventListener("beforeinstallprompt",c=>{c.preventDefault(),v=c,document.getElementById("pwa-install-banner").classList.add("show")});document.getElementById("install-pwa").addEventListener("click",()=>{v&&(v.prompt(),v.userChoice.then(()=>{v=null}),document.getElementById("pwa-install-banner").classList.remove("show"))});document.getElementById("close-banner").addEventListener("click",()=>{document.getElementById("pwa-install-banner").classList.remove("show")});navigator.onLine||document.getElementById("offline-indicator").classList.add("show");class m{static getUserData(){const e=localStorage.getItem("userData");return e?JSON.parse(e):null}static setUserData(e){localStorage.setItem("userData",JSON.stringify(e))}static getToken(){const e=this.getUserData();return e?e.token:null}static getUserId(){const e=this.getUserData();return e?e.userId:null}static getUserName(){const e=this.getUserData();return e?e.name:null}static isLoggedIn(){return!!this.getToken()}static logout(){localStorage.removeItem("userData")}}class w{constructor(){this._baseUrl="https://story-api.dicoding.dev/v1"}async getStories(e=1,t=10,i=0){try{const a=m.getToken();if(!a)throw new Error("Anda belum login");console.log(`Fetching stories: page=${e}, size=${t}, location=${i}`);const r=await(await fetch(`${this._baseUrl}/stories?page=${e}&size=${t}&location=${i}`,{headers:{Authorization:`Bearer ${a}`}})).json();if(r.error)throw new Error(r.message);return console.log("Stories fetched:",r.listStory.length),r.listStory}catch(a){throw console.error("Error getting stories:",a),new Error(a.message||"Gagal mengambil daftar cerita")}}async getStoryDetail(e){try{const t=m.getToken();if(!t)throw new Error("Anda belum login");console.log("Fetching story detail for ID:",e);const a=await(await fetch(`${this._baseUrl}/stories/${e}`,{headers:{Authorization:`Bearer ${t}`}})).json();if(a.error)throw new Error(a.message);return console.log("Story detail fetched"),a.story}catch(t){throw console.error("Error getting story detail:",t),new Error(t.message||"Gagal mengambil detail cerita")}}async addStory(e,t,i=null,a=null){try{const o=m.getToken(),r=new FormData;r.append("description",e),r.append("photo",t),i!==null&&a!==null&&(r.append("lat",i),r.append("lon",a));const s=o?`${this._baseUrl}/stories`:`${this._baseUrl}/stories/guest`,n=o?{Authorization:`Bearer ${o}`}:{};console.log("Adding new story",o?"with auth":"as guest");const d=await(await fetch(s,{method:"POST",headers:n,body:r})).json();if(d.error)throw new Error(d.message);return console.log("Story added successfully"),d}catch(o){throw console.error("Error adding story:",o),new Error(o.message||"Gagal menambahkan cerita")}}}class T{constructor(e,t){this._config=e,this._view=t}async getStories(){try{this._view.showLoading();const e=await this._config.getStories(1,10,1);this._view.renderStories(e)}catch(e){console.error("Home presenter error:",e),this._view.showError(e.message)}}}class h{static async openDB(){return new Promise((e,t)=>{if(!("indexedDB"in window)){t(new Error("Browser tidak mendukung IndexedDB"));return}const i=indexedDB.open(this.DB_NAME,this.DB_VERSION);i.onerror=a=>{console.error("IndexedDB error:",a.target.error),t(new Error("Gagal membuka database"))},i.onsuccess=()=>{e(i.result)},i.onupgradeneeded=a=>{const o=a.target.result;o.objectStoreNames.contains(this.STORE_STORIES)||(o.createObjectStore(this.STORE_STORIES,{keyPath:"id"}),console.log(`Object store ${this.STORE_STORIES} berhasil dibuat`)),o.objectStoreNames.contains(this.STORE_FAVORITES)||(o.createObjectStore(this.STORE_FAVORITES,{keyPath:"id"}),console.log(`Object store ${this.STORE_FAVORITES} berhasil dibuat`))}})}static async saveStories(e){const i=(await this.openDB()).transaction(this.STORE_STORIES,"readwrite"),a=i.objectStore(this.STORE_STORIES);return e.forEach(o=>{a.put(o)}),new Promise((o,r)=>{i.oncomplete=()=>{console.log("Stories berhasil disimpan ke IndexedDB"),o(e)},i.onerror=s=>{console.error("Error menyimpan stories:",s.target.error),r(new Error("Gagal menyimpan stories ke IndexedDB"))}})}static async getStories(){const a=(await this.openDB()).transaction(this.STORE_STORIES,"readonly").objectStore(this.STORE_STORIES).getAll();return new Promise((o,r)=>{a.onsuccess=()=>{o(a.result)},a.onerror=s=>{console.error("Error mengambil stories:",s.target.error),r(new Error("Gagal mengambil stories dari IndexedDB"))}})}static async getStoryById(e){const o=(await this.openDB()).transaction(this.STORE_STORIES,"readonly").objectStore(this.STORE_STORIES).get(e);return new Promise((r,s)=>{o.onsuccess=()=>{r(o.result)},o.onerror=n=>{console.error("Error mengambil story:",n.target.error),s(new Error("Gagal mengambil story dari IndexedDB"))}})}static async deleteStory(e){const o=(await this.openDB()).transaction(this.STORE_STORIES,"readwrite").objectStore(this.STORE_STORIES).delete(e);return new Promise((r,s)=>{o.onsuccess=()=>{console.log(`Story dengan id ${e} berhasil dihapus dari IndexedDB`),r(!0)},o.onerror=n=>{console.error("Error menghapus story:",n.target.error),s(new Error(`Gagal menghapus story dengan id ${e} dari IndexedDB`))}})}static async clearStories(){const a=(await this.openDB()).transaction(this.STORE_STORIES,"readwrite").objectStore(this.STORE_STORIES).clear();return new Promise((o,r)=>{a.onsuccess=()=>{console.log("Semua stories berhasil dihapus dari IndexedDB"),o(!0)},a.onerror=s=>{console.error("Error menghapus semua stories:",s.target.error),r(new Error("Gagal menghapus semua stories dari IndexedDB"))}})}static async addToFavorites(e){const a=(await this.openDB()).transaction(this.STORE_FAVORITES,"readwrite").objectStore(this.STORE_FAVORITES);return new Promise((o,r)=>{const s=a.put(e);s.onsuccess=()=>{console.log("Story berhasil ditambahkan ke favorit"),o(!0)},s.onerror=n=>{console.error("Error menambahkan favorit:",n.target.error),r(new Error("Gagal menambahkan story ke favorit"))}})}static async removeFromFavorites(e){const a=(await this.openDB()).transaction(this.STORE_FAVORITES,"readwrite").objectStore(this.STORE_FAVORITES);return new Promise((o,r)=>{const s=a.delete(e);s.onsuccess=()=>{console.log("Story berhasil dihapus dari favorit"),o(!0)},s.onerror=n=>{console.error("Error menghapus favorit:",n.target.error),r(new Error("Gagal menghapus story dari favorit"))}})}static async getFavorites(){const i=(await this.openDB()).transaction(this.STORE_FAVORITES,"readonly").objectStore(this.STORE_FAVORITES);return new Promise((a,o)=>{const r=i.getAll();r.onsuccess=()=>{a(r.result)},r.onerror=s=>{console.error("Error mengambil favorit:",s.target.error),o(new Error("Gagal mengambil daftar favorit"))}})}static async isFavorite(e){const a=(await this.openDB()).transaction(this.STORE_FAVORITES,"readonly").objectStore(this.STORE_FAVORITES);return new Promise((o,r)=>{const s=a.get(e);s.onsuccess=()=>{o(!!s.result)},s.onerror=n=>{console.error("Error memeriksa favorit:",n.target.error),r(new Error("Gagal memeriksa status favorit"))}})}}f(h,"DB_NAME","storyapps-db"),f(h,"DB_VERSION",1),f(h,"STORE_STORIES","stories"),f(h,"STORE_FAVORITES","favorites");class C{constructor(){this._config=new w,this._presenter=null,this._showFavorites=!1,this._title="StoryApps"}async render(){return document.title=this._title,`
      <section class="home-page page-transition">
        <!-- Hero Section -->
        <div class="hero-section">
          <div class="hero-content">
            <div class="hero-text">
              <h1 class="hero-title">Bagikan Ceritamu</h1>
              <p class="hero-description">
                Bergabunglah dengan komunitas Dicoding dan bagikan pengalaman menarik 
                Anda. Temukan inspirasi dari cerita-cerita luar biasa dari seluruh Indonesia.
              </p>
              <div class="hero-actions">
                <a href="#/add" class="btn btn-primary hero-btn">
                  <i class="fas fa-plus"></i>
                  <span>Tambah Cerita</span>
                </a>
                <a href="#/map" class="btn btn-secondary hero-btn">
                  <i class="fas fa-map-marked-alt"></i>
                  <span>Jelajahi Peta</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="coordinator-layout">
          <div class="coordinator-header">
            <div>
              <h2 class="coordinator-title">Cerita Terbaru</h2>
              <p>Jelajahi dan bagikan cerita menarik dari komunitas Dicoding</p>
            </div>
            <button id="toggle-favorites" class="btn btn-outline">
              <i class="fas fa-heart"></i>
              <span>Cerita Favorit</span>
            </button>
          </div>
          <div id="stories-container" class="coordinator-grid">
            <div class="loader" id="stories-loader"></div>
          </div>
          <div id="error-container" class="error-container hidden"></div>
        </div>
      </section>
    `}async afterRender(){this._presenter=new T(this._config,this);const e=document.getElementById("toggle-favorites");e&&e.addEventListener("click",()=>{this._showFavorites=!this._showFavorites,this._refreshContent()}),await this._presenter.getStories()}async _refreshContent(){const e=document.getElementById("toggle-favorites"),t=document.querySelector(".coordinator-title");if(this._showFavorites)try{this.showLoading();const i=await h.getFavorites();this.renderStories(i),e&&(e.innerHTML='<i class="fas fa-list"></i> Semua Cerita'),t&&(t.textContent="Cerita Favorit")}catch(i){console.error("Error loading favorites:",i),this.showError("Gagal memuat cerita favorit")}else e&&(e.innerHTML='<i class="fas fa-bookmark"></i> Cerita Favorit'),t&&(t.textContent="Cerita Terbaru"),await this._presenter.getStories()}showLoading(){const e=document.getElementById("stories-loader");e&&e.classList.remove("hidden");const t=document.getElementById("error-container");t&&t.classList.add("hidden");const i=document.getElementById("stories-container");i&&[...i.children].forEach(a=>{a.id!=="stories-loader"&&a.remove()})}hideLoading(){const e=document.getElementById("stories-loader");e&&e.classList.add("hidden")}async renderStories(e){this.hideLoading();const t=document.getElementById("stories-container");if(t){if(e.length===0){t.innerHTML=`
        <div class="empty-state">
          <p>${this._showFavorites?"Belum ada cerita favorit.":"Belum ada cerita yang dibagikan."}</p>
        </div>
      `;return}t.innerHTML="";for(const i of e){const a=i.name?i.name.charAt(0).toUpperCase():"?",o=await h.isFavorite(i.id),r=document.createElement("article");r.classList.add("story-card"),r.innerHTML=`
        <div class="story-image-container">
          <img
            src="${i.photoUrl}"
            alt="Cerita dari ${i.name}"
            class="story-image"
            loading="lazy"
            onerror="this.src='./src/public/fallback.jpg';"
          />
        </div>
        <div class="story-content">
          <div class="user-info">
            <div class="user-avatar">${a}</div>
            <span class="user-name">${i.name}</span>
          </div>
          <h3 class="story-title">${i.name}</h3>
          <p class="story-description">${this._truncateText(i.description,100)}</p>
          <div class="story-meta">
            <div class="story-info">
              <i class="fas fa-calendar-alt"></i>
              <span>${this._formatDate(i.createdAt)}</span>
            </div>
            ${i.lat&&i.lon?`
              <div class="story-info">
                <i class="fas fa-map-marker-alt"></i>
                <span>Lokasi tersedia</span>
              </div>`:""}
          </div>
          <div class="story-actions">
            <button class="favorite-btn ${o?"favorited":""}" 
                    data-id="${i.id}"
                    data-tooltip="${o?"Klik untuk menghapus dari favorit":"Klik untuk menyimpan cerita"}"
                    data-label="${o?"Tersimpan":"Simpan"}">
              <i class="fa-${o?"solid":"regular"} fa-bookmark"></i>
            </button>
            <a href="#" class="view-details-btn" data-id="${i.id}">
              View Details
            </a>
          </div>
        </div>
      `,t.appendChild(r),r.querySelector(".view-details-btn").addEventListener("click",s=>{s.preventDefault(),window.selectedStoryId=i.id,window.location.href="#/detail"}),r.querySelector(".favorite-btn").addEventListener("click",async s=>{s.preventDefault();const n=s.currentTarget,l=n.querySelector("i");n.classList.add("loading"),n.disabled=!0;try{await h.isFavorite(i.id)?(await h.removeFromFavorites(i.id),n.classList.remove("favorited"),l.classList.replace("fa-solid","fa-regular"),n.setAttribute("data-tooltip","Klik untuk menyimpan cerita")):(await h.addToFavorites(i),n.classList.add("favorited","success"),l.classList.replace("fa-regular","fa-solid"),n.setAttribute("data-tooltip","Klik untuk menghapus dari favorit"),setTimeout(()=>{n.classList.remove("success")},600)),this._showFavorites&&this._refreshContent()}catch(d){console.error("Error toggling favorite:",d),n.style.background="#ef4444",setTimeout(()=>{n.style.background=""},1e3)}finally{n.classList.remove("loading"),n.disabled=!1}})}}}showError(e){this.hideLoading();const t=document.getElementById("error-container");t&&(t.classList.remove("hidden"),t.innerHTML=`
      <div class="error-content">
        <i class="fas fa-exclamation-triangle fa-3x"></i>
        <h3>Gagal memuat cerita</h3>
        <p>${e}</p>
        <button id="retry-button" class="btn">Coba Lagi</button>
      </div>
    `,document.getElementById("retry-button").addEventListener("click",async()=>{await this._presenter.getStories()}))}_truncateText(e,t){return e.length<=t?e:`${e.substr(0,t)}...`}_formatDate(e){const t={year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"};return new Date(e).toLocaleDateString("id-ID",t)}}class P{constructor(e,t){this._config=e,this._view=t}async addStory(e,t,i,a){try{if(this._view.clearAlert(),this._view.showLoading(),!e)throw new Error("Deskripsi cerita wajib diisi");if(!t)throw new Error("Foto wajib diambil");console.log("Adding story with",i&&a?"location":"no location");const o=await this._config.addStory(e,t,i,a);console.log("Story added successfully"),this._view.showAlert("Cerita berhasil dibagikan!","success"),setTimeout(()=>{window.location.href="#/"},1500)}catch(o){console.error("Add story presenter error:",o),this._view.hideLoading(),this._view.showAlert(o.message)}}}class M{constructor(){this._config=new w,this._presenter=null,this._map=null,this._marker=null,this._cameraStream=null,this._photoBlob=null,this._selectedLocation=null,this._photoSource=null,this._hashChangeHandler=null}async render(){return console.log("Rendering add story page"),`
      <section class="add-story-page page-transition">
        <div class="coordinator-layout">
          <div class="coordinator-header">
            <div>
              <h2 class="coordinator-title">Tambah Cerita Baru</h2>
              <p>Bagikan pengalaman dan cerita menarikmu dengan komunitas</p>
            </div>
          </div>
          
          <div class="form-container">
            <div id="alert-container"></div>
            
            <form id="add-story-form">
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-camera"></i> Foto Cerita
                </label>
                <div class="camera-container">
                  <div class="camera-preview">
                    <video id="camera-stream" autoplay playsinline></video>
                    <canvas id="photo-canvas" class="hidden"></canvas>
                    <img id="photo-preview" class="hidden" alt="Preview foto yang diambil">
                  </div>
                  <div class="camera-buttons">
                    <button type="button" id="start-camera" class="btn">
                      <i class="fas fa-camera"></i> Mulai Kamera
                    </button>
                    <button type="button" id="upload-photo" class="btn">
                      <i class="fas fa-upload"></i> Upload Foto
                    </button>
                    <input type="file" id="photo-upload" accept="image/*" class="hidden">
                    <button type="button" id="capture-photo" class="btn hidden" disabled>
                      <i class="fas fa-camera-retro"></i> Ambil Foto
                    </button>
                    <button type="button" id="retake-photo" class="btn hidden">
                      <i class="fas fa-redo"></i> Ambil Ulang
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="form-group">
                <label for="description" class="form-label">
                  <i class="fas fa-pen"></i> Deskripsi Cerita
                </label>
                <textarea 
                  id="description" 
                  name="description" 
                  class="form-textarea" 
                  required
                  placeholder="Ceritakan pengalamanmu..."
                ></textarea>
              </div>
              
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-map-marker-alt"></i> Lokasi
                </label>
                <p class="form-help">Klik pada peta untuk menandai lokasi ceritamu</p>
                <div id="storyMap" class="map-container"></div>
                <div id="location-info" class="location-info hidden">
                  <div>
                    <i class="fas fa-map-marker-alt"></i>
                    <span>Koordinat: <span id="location-text"></span></span>
                  </div>
                  <button type="button" id="clear-location" class="btn btn-sm btn-danger">
                    <i class="fas fa-times"></i> Hapus Lokasi
                  </button>
                </div>
              </div>
              
              <div class="form-actions">
                <a href="#/" class="btn btn-secondary">Batal</a>
                <button type="submit" class="btn btn-success">
                  <i class="fas fa-paper-plane"></i> Bagikan Cerita
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    `}async afterRender(){console.log("Add story page afterRender"),this._presenter=new P(this._config,this),setTimeout(()=>{this._initMap()},100),this._initCameraButtons(),this._initFormSubmission(),this._setupHashChangeListener()}_setupHashChangeListener(){this._hashChangeHandler=()=>{console.log("Hash changed, stopping camera if active"),this._stopCameraStream()},window.addEventListener("hashchange",this._hashChangeHandler),console.log("HashChange listener added for camera cleanup")}_initMap(){try{console.log("Initializing add story map"),this._map=L.map("storyMap").setView([-2.5489,118.0149],5);const e=L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:19}),t=L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{attribution:"Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",maxZoom:19}),i=L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",{attribution:'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',maxZoom:17}),a={OpenStreetMap:e,Satelit:t,Topografi:i};L.control.layers(a).addTo(this._map),e.addTo(this._map),this._map.on("click",o=>{this._handleMapClick(o.latlng)}),this._map.locate({setView:!0,maxZoom:16}),this._map.on("locationfound",o=>{this._map.setView(o.latlng,16)}),setTimeout(()=>{this._map.invalidateSize()},100)}catch(e){console.error("Error initializing map:",e)}}_handleMapClick(e){this._marker&&this._map.removeLayer(this._marker),this._marker=L.marker(e).addTo(this._map),this._marker.bindPopup("Lokasi cerita Anda").openPopup(),this._selectedLocation={lat:e.lat,lon:e.lng};const t=document.getElementById("location-info"),i=document.getElementById("location-text");if(t&&i){t.classList.remove("hidden"),i.textContent=`${e.lat.toFixed(6)}, ${e.lng.toFixed(6)}`;const a=document.getElementById("clear-location");a&&a.addEventListener("click",()=>{this._clearLocation()})}}_clearLocation(){this._marker&&(this._map.removeLayer(this._marker),this._marker=null),this._selectedLocation=null;const e=document.getElementById("location-info");e&&e.classList.add("hidden")}_initCameraButtons(){const e=document.getElementById("start-camera"),t=document.getElementById("capture-photo"),i=document.getElementById("retake-photo"),a=document.getElementById("upload-photo"),o=document.getElementById("photo-upload");if(!e||!t||!i||!a||!o){console.error("Camera buttons not found");return}e.addEventListener("click",()=>{this._startCamera()}),t.addEventListener("click",()=>{this._capturePhoto()}),i.addEventListener("click",()=>{this._retakePhoto()}),a.addEventListener("click",()=>{o.click()}),o.addEventListener("change",r=>{this._handlePhotoUpload(r)})}_handlePhotoUpload(e){const t=e.target.files[0];if(!t)return;if(!t.type.startsWith("image/")){this.showAlert("Silakan pilih file gambar");return}this._photoSource="upload";const i=new FileReader;i.onload=a=>{const o=document.getElementById("photo-preview");o&&(o.src=a.target.result,o.classList.remove("hidden"));const r=document.getElementById("camera-stream");r&&r.classList.add("hidden"),this._stopCameraStream(),fetch(a.target.result).then(u=>u.blob()).then(u=>{this._photoBlob=u});const s=document.getElementById("start-camera"),n=document.getElementById("upload-photo"),l=document.getElementById("capture-photo"),d=document.getElementById("retake-photo");s&&s.classList.add("hidden"),n&&n.classList.add("hidden"),l&&(l.classList.add("hidden"),l.disabled=!0),d&&(d.classList.remove("hidden"),d.innerHTML='<i class="fas fa-redo"></i> Upload Ulang')},i.readAsDataURL(t)}async _startCamera(){try{console.log("Starting camera"),this._cameraStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"},audio:!1});const e=document.getElementById("camera-stream");if(!e)throw new Error("Video element not found");e.srcObject=this._cameraStream,e.classList.remove("hidden");const t=document.getElementById("photo-preview");t&&t.classList.add("hidden");const i=document.getElementById("capture-photo");i&&(i.disabled=!1,i.classList.remove("hidden"));const a=document.getElementById("start-camera"),o=document.getElementById("upload-photo");a&&a.classList.add("hidden"),o&&o.classList.add("hidden");const r=document.getElementById("retake-photo");r&&r.classList.add("hidden")}catch(e){console.error("Camera access error:",e),this.showAlert("Tidak dapat mengakses kamera: "+e.message)}}_capturePhoto(){try{console.log("Capturing photo");const e=document.getElementById("camera-stream"),t=document.getElementById("photo-canvas"),i=document.getElementById("photo-preview");if(!e||!t||!i)throw new Error("Required elements not found");t.width=e.videoWidth,t.height=e.videoHeight,t.getContext("2d").drawImage(e,0,0,t.width,t.height),t.toBlob(o=>{this._photoBlob=o,this._photoSource="camera";const r=URL.createObjectURL(o);i.src=r,i.classList.remove("hidden"),e.classList.add("hidden"),this._stopCameraStream();const s=document.getElementById("retake-photo"),n=document.getElementById("capture-photo"),l=document.getElementById("start-camera"),d=document.getElementById("upload-photo");s&&(s.classList.remove("hidden"),s.innerHTML='<i class="fas fa-redo"></i> Ambil Ulang'),n&&(n.classList.add("hidden"),n.disabled=!0),l&&l.classList.add("hidden"),d&&d.classList.add("hidden")},"image/jpeg",.8)}catch(e){console.error("Error capturing photo:",e),this.showAlert("Error capturing photo: "+e.message)}}_retakePhoto(){console.log("Retaking photo"),this._photoBlob=null,this._photoSource=null;const e=document.getElementById("start-camera"),t=document.getElementById("upload-photo");e&&e.classList.remove("hidden"),t&&t.classList.remove("hidden");const i=document.getElementById("retake-photo");i&&i.classList.add("hidden");const a=document.getElementById("photo-preview");a&&a.classList.add("hidden");const o=document.getElementById("capture-photo");o&&(o.classList.add("hidden"),o.disabled=!0);const r=document.getElementById("camera-stream");r&&r.classList.add("hidden");const s=document.getElementById("photo-upload");s&&(s.value="")}_stopCameraStream(){this._cameraStream&&(this._cameraStream.getTracks().forEach(t=>t.stop()),this._cameraStream=null,console.log("Camera stream stopped"))}_initFormSubmission(){const e=document.getElementById("add-story-form");if(!e){console.error("Add story form not found");return}e.addEventListener("submit",async t=>{t.preventDefault();const i=document.getElementById("description").value;if(!this._photoBlob){this.showAlert("Silakan ambil foto terlebih dahulu");return}if(!i){this.showAlert("Silakan masukkan deskripsi cerita");return}const a=this._selectedLocation?this._selectedLocation.lat:null,o=this._selectedLocation?this._selectedLocation.lon:null;await this._presenter.addStory(i,this._photoBlob,a,o)})}showLoading(){const e=document.querySelector('#add-story-form button[type="submit"]');e&&(e.innerHTML='<i class="fas fa-spinner fa-spin"></i> Mengirim...',e.disabled=!0)}hideLoading(){const e=document.querySelector('#add-story-form button[type="submit"]');e&&(e.innerHTML='<i class="fas fa-paper-plane"></i> Bagikan Cerita',e.disabled=!1)}showAlert(e,t="danger"){const i=document.getElementById("alert-container");if(!i){console.error("Alert container not found");return}i.innerHTML=`
      <div class="alert alert-${t}">
        <i class="fas fa-${t==="danger"?"exclamation-triangle":"check-circle"}"></i>
        ${e}
      </div>
    `,i.scrollIntoView({behavior:"smooth"})}clearAlert(){const e=document.getElementById("alert-container");e&&(e.innerHTML="")}beforeUnload(){console.log("AddStoryPage beforeUnload called"),this._stopCameraStream(),this._hashChangeHandler&&(window.removeEventListener("hashchange",this._hashChangeHandler),this._hashChangeHandler=null,console.log("HashChange listener removed")),this._map&&(this._map.remove(),this._map=null)}}class A{constructor(e,t){this._config=e,this._view=t}async getStoriesWithLocation(){try{this._view.showLoading();const t=(await this._config.getStories(1,100,1)).filter(i=>i.lat&&i.lon);console.log("Stories with location:",t.length),this._view.renderStoriesOnMap(t)}catch(e){console.error("Map presenter error:",e),this._view.showError(e.message)}}}class D{constructor(){this._config=new w,this._presenter=null,this._map=null,this._markers=[],this._markerCluster=null}async render(){return console.log("Rendering map page"),`
      <section class="map-page page-transition">
        <div class="coordinator-layout">
          <div class="coordinator-header">
            <div>
              <h2 class="coordinator-title">Peta Cerita</h2>
              <p>Jelajahi cerita berdasarkan lokasi di seluruh dunia</p>
            </div>
            <div class="map-controls">
              <div class="map-info">
                <span class="map-stats">
                  <i class="fas fa-map-marker-alt"></i> <span id="stories-count">0</span> Cerita dengan Lokasi
                </span>
              </div>
            </div>
          </div>
          
          <div class="map-container-wrapper">
            <div id="stories-map-container" class="stories-map-container">
              <!-- Map will be rendered here -->
            </div>
            <div id="map-loading-overlay" class="map-loading-overlay">
              <div class="loader"></div>
            </div>
          </div>
          
          <div id="error-container" class="error-container hidden"></div>
        </div>
      </section>
    `}async afterRender(){console.log("Map page afterRender"),this._presenter=new A(this._config,this),setTimeout(()=>{this._initMap(),this._presenter.getStoriesWithLocation()},100)}_initMap(){try{console.log("Initializing stories map"),this._map=L.map("stories-map-container").setView([-2.5489,118.0149],5);const e=L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:19}),t=L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{attribution:"Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",maxZoom:19}),i=L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",{attribution:'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',maxZoom:17}),a=L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',subdomains:"abcd",maxZoom:19}),o=L.tileLayer("https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}",{attribution:'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',subdomains:"abcd",minZoom:0,maxZoom:18,ext:"png"}),r={OpenStreetMap:e,"CartoDB Light":a,"Stamen Terrain":o,Satelit:t,Topografi:i};L.control.layers(r).addTo(this._map),L.control.scale().addTo(this._map),e.addTo(this._map),this._map.locate({setView:!0,maxZoom:6}),this._markerCluster=L.markerClusterGroup({showCoverageOnHover:!1,maxClusterRadius:50,iconCreateFunction:function(s){const n=s.getChildCount();let l="small";return n>10&&(l="medium"),n>25&&(l="large"),L.divIcon({html:`<div class="cluster-icon"><span>${n}</span></div>`,className:`marker-cluster marker-cluster-${l}`,iconSize:L.point(40,40)})}}),this._map.addLayer(this._markerCluster),setTimeout(()=>{this._map.invalidateSize()},100)}catch(e){console.error("Error initializing map:",e)}}showLoading(){const e=document.getElementById("map-loading-overlay");e&&e.classList.add("active");const t=document.getElementById("error-container");t&&t.classList.add("hidden")}hideLoading(){const e=document.getElementById("map-loading-overlay");e&&e.classList.remove("active")}renderStoriesOnMap(e){if(console.log("Rendering stories on map:",e.length),this.hideLoading(),this._clearMarkers(),e.length===0){this.showError("Tidak ada cerita dengan lokasi yang tersedia");return}const t=document.getElementById("stories-count");t&&(t.textContent=e.length),e.forEach(i=>{if(i.lat&&i.lon)try{const a=L.marker([i.lat,i.lon],{icon:L.divIcon({html:'<div class="custom-marker"><i class="fas fa-map-marker-alt"></i></div>',className:"custom-marker-container",iconSize:[30,42],iconAnchor:[15,42]})}),o=`
            <div class="map-popup">
              <img src="${i.photoUrl}" alt="${i.name}" width="100%">
              <h3>${i.name}</h3>
              <p>${this._truncateText(i.description,100)}</p>
              <button class="btn view-details-btn" data-id="${i.id}">
                <i class="fas fa-eye"></i> View Details
              </button>
            </div>
          `;a.bindPopup(o,{maxWidth:300,minWidth:200,className:"custom-popup"}),this._markerCluster.addLayer(a),this._markers.push(a),a.on("popupopen",()=>{const r=document.querySelector(`.view-details-btn[data-id="${i.id}"]`);r&&r.addEventListener("click",()=>{window.selectedStoryId=i.id,window.location.href="#/detail"})})}catch(a){console.error("Error adding marker for story:",i.id,a)}}),this._markers.length>0&&this._markerCluster.getLayers().length>0&&this._map.fitBounds(this._markerCluster.getBounds().pad(.1))}_clearMarkers(){this._markerCluster&&this._markerCluster.clearLayers(),this._markers=[]}showError(e){this.hideLoading();const t=document.getElementById("error-container");if(!t){console.error("Error container not found");return}t.classList.remove("hidden"),t.innerHTML=`
      <div class="error-content">
        <i class="fas fa-exclamation-triangle fa-3x"></i>
        <h3>Tidak ada cerita dengan lokasi</h3>
        <p>${e}</p>
        <button id="retry-button" class="btn">
          <i class="fas fa-sync-alt"></i> Coba Lagi
        </button>
      </div>
    `;const i=document.getElementById("retry-button");i&&i.addEventListener("click",async()=>{await this._presenter.getStoriesWithLocation()})}_truncateText(e,t){return e.length<=t?e:e.substr(0,t)+"..."}beforeUnload(){this._map&&(this._map.remove(),this._map=null)}}class O{constructor(e,t){this._config=e,this._view=t}async getStoryDetail(e){try{this._view.showLoading();const t=await this._config.getStoryDetail(e);this._view.renderStoryDetail(t)}catch(t){console.error("Detail presenter error:",t),this._view.showError(t.message)}}}class R{constructor(){this._config=new w,this._presenter=null,this._map=null}async render(){return console.log("Rendering detail page"),`
      <section class="detail-page page-transition">
        <div id="story-detail-container" class="story-detail">
          <div class="loader" id="detail-loader"></div>
        </div>
        <div id="error-container" class="error-container hidden"></div>
      </section>
    `}async afterRender(){console.log("Detail page afterRender");const e=window.selectedStoryId;if(!e){this.showError("ID cerita tidak ditemukan");return}this._presenter=new O(this._config,this),await this._presenter.getStoryDetail(e)}showLoading(){const e=document.getElementById("detail-loader");e&&e.classList.remove("hidden");const t=document.getElementById("error-container");t&&t.classList.add("hidden")}hideLoading(){const e=document.getElementById("detail-loader");e&&e.classList.add("hidden")}renderStoryDetail(e){console.log("Rendering story detail:",e.id),this.hideLoading();const t=document.getElementById("story-detail-container");if(!t){console.error("Detail container not found");return}const i=e.name.charAt(0).toUpperCase();t.innerHTML=`
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-title">${e.name}'s Story</div>
          <button class="modal-close">&times;</button>
        </div>
        
        <img 
          src="${e.photoUrl}" 
          alt="Cerita dari ${e.name}" 
          class="story-detail-image"
        />
        
        <div class="story-detail-content">
          <div class="user-info">
            <div class="user-avatar">${i}</div>
            <span class="user-name">${e.name}</span>
          </div>
          
          <div class="story-meta">
            <div class="story-info">
              <i class="fas fa-calendar-alt"></i>
              <span>${this._formatDate(e.createdAt)}</span>
            </div>
            
            ${e.lat&&e.lon?`<div class="story-info">
                <i class="fas fa-map-marker-alt"></i>
                <span>Koordinat: ${e.lat.toFixed(6)}, ${e.lon.toFixed(6)}</span>
              </div>`:`<div class="story-info">
                <i class="fas fa-map-marker-alt"></i>
                <span>Tidak ada informasi lokasi</span>
              </div>`}
          </div>
          
          <div class="story-description-full">
            <h3>Cerita</h3>
            <p>${e.description}</p>
          </div>
          
          ${e.lat&&e.lon?`<div class="story-location">
              <h3>Lokasi</h3>
              <div class="story-location-map" id="detail-map"></div>
            </div>`:""}
        </div>
        
        <div class="modal-footer">
          <a href="#/" class="btn btn-secondary">Kembali ke Beranda</a>
        </div>
      </div>
    `;const a=t.querySelector(".modal-close");a&&a.addEventListener("click",()=>{window.location.href="#/"}),e.lat&&e.lon&&setTimeout(()=>{this._initMap(e)},100)}_initMap(e){try{console.log("Initializing map for location:",e.lat,e.lon),this._map=L.map("detail-map").setView([e.lat,e.lon],13);const t=L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:19}),i=L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{attribution:"Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",maxZoom:19}),a=L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",{attribution:'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',maxZoom:17}),o={OpenStreetMap:t,Satelit:i,Topografi:a};L.control.layers(o).addTo(this._map),t.addTo(this._map),L.marker([e.lat,e.lon]).addTo(this._map).bindPopup(`<b>${e.name}'s Story</b><br>${this._truncateText(e.description,100)}`).openPopup(),setTimeout(()=>{this._map.invalidateSize()},100)}catch(t){console.error("Error initializing map:",t)}}showError(e){this.hideLoading();const t=document.getElementById("error-container");if(!t){console.error("Error container not found");return}t.classList.remove("hidden"),t.innerHTML=`
      <div class="error-content">
        <i class="fas fa-exclamation-triangle fa-3x"></i>
        <h3>Story not found</h3>
        <p>${e}</p>
        <a href="#/" class="btn">Kembali ke Beranda</a>
      </div>
    `}_formatDate(e){const t={year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"};return new Date(e).toLocaleDateString("id-ID",t)}_truncateText(e,t){return e.length<=t?e:e.substr(0,t)+"..."}beforeUnload(){this._map&&(this._map.remove(),this._map=null)}}class k{constructor(){this._baseUrl="https://story-api.dicoding.dev/v1"}async login(e,t){try{console.log("Trying to login with:",e);const a=await(await fetch(`${this._baseUrl}/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,password:t})})).json();if(a.error)throw new Error(a.message);return console.log("Login successful:",a),a.loginResult}catch(i){throw console.error("Login error:",i),new Error(i.message||"Gagal melakukan login")}}async register(e,t,i){try{console.log("Registering new user:",t);const o=await(await fetch(`${this._baseUrl}/register`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:e,email:t,password:i})})).json();if(o.error)throw new Error(o.message);return console.log("Registration successful"),o}catch(a){throw console.error("Registration error:",a),new Error(a.message||"Gagal melakukan registrasi")}}async subscribeNotification(e){try{const t=m.getToken();if(!t)throw new Error("Anda belum login");const a=await(await fetch(`${this._baseUrl}/notifications/subscribe`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},body:JSON.stringify(e)})).json();if(a.error)throw new Error(a.message);return a}catch(t){throw console.error("Notification subscription error:",t),new Error(t.message||"Gagal berlangganan notifikasi")}}async unsubscribeNotification(e){try{const t=m.getToken();if(!t)throw new Error("Anda belum login");const a=await(await fetch(`${this._baseUrl}/notifications/subscribe`,{method:"DELETE",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},body:JSON.stringify({endpoint:e})})).json();if(a.error)throw new Error(a.message);return a}catch(t){throw console.error("Unsubscribe error:",t),new Error(t.message||"Gagal berhenti berlangganan notifikasi")}}}const E=Object.freeze(Object.defineProperty({__proto__:null,AuthConfig:k},Symbol.toStringTag,{value:"Module"}));class x{constructor(e,t){this._config=e,this._view=t}async login(e,t){try{if(this._view.clearAlert(),this._view.showLoading(),!e||!t)throw new Error("Email dan password harus diisi");if(t.length<8)throw new Error("Password minimal 8 karakter");console.log("Login validation passed, calling API");const i=await this._config.login(e,t);console.log("Login successful, saving user data"),m.setUserData(i),console.log("Redirecting to home page"),window.location.href="#/",window.location.reload()}catch(i){console.error("Login presenter error:",i),this._view.hideLoading(),this._view.showAlert(i.message)}}}class ${constructor(){this._config=new k,this._presenter=null}async render(){return console.log("Rendering login page"),`
      <section class="login-page page-transition">
        <div class="form-container">
          <h2 class="form-title">Login</h2>
          
          <div id="alert-container"></div>
          
          <form id="login-form">
            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                class="form-input" 
                required
                placeholder="Masukkan email Anda"
              >
            </div>
            
            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                class="form-input" 
                required
                placeholder="Masukkan password"
                minlength="8"
              >
            </div>
            
            <button type="submit" class="btn btn-block">
              <i class="fas fa-sign-in-alt"></i> Login
            </button>
          </form>
          
          <div class="form-footer">
            <p>Belum memiliki akun? <a href="#/register">Daftar Sekarang</a></p>
          </div>
        </div>
      </section>
    `}async afterRender(){console.log("Login page afterRender"),this._presenter=new x(this._config,this);const e=document.getElementById("login-form");if(!e){console.error("Login form not found in DOM");return}e.addEventListener("submit",async t=>{t.preventDefault();const i=document.getElementById("email").value,a=document.getElementById("password").value;await this._presenter.login(i,a)})}showLoading(){const e=document.querySelector('#login-form button[type="submit"]');e&&(e.innerHTML='<i class="fas fa-spinner fa-spin"></i> Loading...',e.disabled=!0)}hideLoading(){const e=document.querySelector('#login-form button[type="submit"]');e&&(e.innerHTML='<i class="fas fa-sign-in-alt"></i> Login',e.disabled=!1)}showAlert(e,t="danger"){const i=document.getElementById("alert-container");i&&(i.innerHTML=`
        <div class="alert alert-${t}">
          ${e}
        </div>
      `,i.scrollIntoView({behavior:"smooth"}))}clearAlert(){const e=document.getElementById("alert-container");e&&(e.innerHTML="")}}class N{constructor(e,t){this._config=e,this._view=t}async register(e,t,i,a){try{if(this._view.clearAlert(),this._view.showLoading(),!e||!t||!i||!a)throw new Error("Semua field harus diisi");if(i.length<8)throw new Error("Password minimal 8 karakter");if(i!==a)throw new Error("Password dan konfirmasi password tidak cocok");console.log("Register validation passed, calling API"),await this._config.register(e,t,i),console.log("Registration successful"),this._view.showAlert("Registrasi berhasil. Silakan login.","success"),setTimeout(()=>{window.location.href="#/login"},2e3)}catch(o){console.error("Register presenter error:",o),this._view.hideLoading(),o.message==="Email is already taken"?this._view.showAlert("Email sudah terdaftar, silakan gunakan email lain atau login."):this._view.showAlert(o.message)}}}class U{constructor(){this._config=new k,this._presenter=null}async render(){return console.log("Rendering register page"),`
      <section class="register-page page-transition">
        <div class="form-container">
          <h2 class="form-title">Daftar Akun Baru</h2>
          
          <div id="alert-container"></div>
          
          <form id="register-form">
            <div class="form-group">
              <label for="name" class="form-label">Nama</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                class="form-input" 
                required
                placeholder="Masukkan nama Anda"
              >
            </div>
            
            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                class="form-input" 
                required
                placeholder="Masukkan email Anda"
              >
            </div>
            
            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                class="form-input" 
                required
                placeholder="Masukkan password"
                minlength="8"
              >
              <small>Password minimal 8 karakter</small>
            </div>
            
            <div class="form-group">
              <label for="confirmPassword" class="form-label">Konfirmasi Password</label>
              <input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword" 
                class="form-input" 
                required
                placeholder="Konfirmasi password Anda"
                minlength="8"
              >
            </div>
            
            <button type="submit" class="btn btn-block">
              <i class="fas fa-user-plus"></i> Daftar
            </button>
          </form>
          
          <div class="form-footer">
            <p>Sudah memiliki akun? <a href="#/login">Login Sekarang</a></p>
          </div>
        </div>
      </section>
    `}async afterRender(){console.log("Register page afterRender"),this._presenter=new N(this._config,this);const e=document.getElementById("register-form");if(!e){console.error("Register form not found in DOM");return}e.addEventListener("submit",async t=>{t.preventDefault();const i=document.getElementById("name").value,a=document.getElementById("email").value,o=document.getElementById("password").value,r=document.getElementById("confirmPassword").value;await this._presenter.register(i,a,o,r)})}showLoading(){const e=document.querySelector('#register-form button[type="submit"]');e&&(e.innerHTML='<i class="fas fa-spinner fa-spin"></i> Loading...',e.disabled=!0)}hideLoading(){const e=document.querySelector('#register-form button[type="submit"]');e&&(e.innerHTML='<i class="fas fa-user-plus"></i> Daftar',e.disabled=!1)}showAlert(e,t="danger"){const i=document.getElementById("alert-container");i&&(i.innerHTML=`
        <div class="alert alert-${t}">
          ${e}
        </div>
      `,i.scrollIntoView({behavior:"smooth"}))}clearAlert(){const e=document.getElementById("alert-container");e&&(e.innerHTML="")}}class F{constructor(){this._title="halaman tidak ditemukan - StoryApps"}async render(){return document.title=this._title,`
      <section class="not-found-page page-transition">
        <div class="not-found-container">
          <div class="not-found-content">
            <h1>404</h1>
            <h2>Halaman Tidak Ditemukan</h2>
            <p>Maaf, halaman yang Anda cari tidak tersedia atau mungkin telah dipindahkan.</p>
            <a href="#/" class="btn btn-primary">Kembali ke Beranda</a>
          </div>
        </div>
      </section>
    `}async afterRender(){const e=document.querySelector(".not-found-content");e&&e.classList.add("animate-fade-in")}}class H{constructor(){this._title="StoryApps"}async render(){return document.title=this._title,`
      <section class="favorites-page page-transition">
        <div class="coordinator-layout">
          <div class="coordinator-header">
            <div>
              <h2 class="coordinator-title">Cerita Favorit</h2>
              <p>Kumpulan cerita yang Anda tandai sebagai favorit</p>
            </div>
            <a href="#/" class="btn btn-secondary">
              <i class="fas fa-arrow-left"></i> Kembali ke Beranda
            </a>
          </div>
          
          <div id="favorites-container" class="coordinator-grid">
            <div class="loader" id="favorites-loader"></div>
          </div>
          
          <div id="error-container" class="error-container hidden"></div>
        </div>
      </section>
    `}async afterRender(){if(!m.isLoggedIn()){window.location.href="#/login";return}this.showLoading();try{const e=await h.getFavorites();this.renderFavorites(e)}catch(e){console.error("Error loading favorites:",e),this.showError("Gagal memuat cerita favorit: "+e.message)}}showLoading(){const e=document.getElementById("favorites-loader");e&&e.classList.remove("hidden");const t=document.getElementById("error-container");t&&t.classList.add("hidden")}hideLoading(){const e=document.getElementById("favorites-loader");e&&e.classList.add("hidden")}async renderFavorites(e){this.hideLoading();const t=document.getElementById("favorites-container");if(!t){console.error("Favorites container not found");return}if(!e||e.length===0){t.innerHTML=`
        <div class="empty-state">
          <p>Belum ada cerita difavorit.</p>
          <a href="#/" class="btn btn-primary">Jelajahi Cerita</a>
        </div>
      `;return}t.innerHTML="",e.forEach(i=>{const a=i.name.charAt(0).toUpperCase(),o=document.createElement("article");o.classList.add("story-card"),o.innerHTML=`
        <div class="story-image-container">
          <img
            src="${i.photoUrl}"
            alt="Cerita dari ${i.name}"
            class="story-image"
            loading="lazy"
            onerror="this.src='./src/public/fallback.jpg';"
          />
        </div>
        <div class="story-content">
          <div class="user-info">
            <div class="user-avatar">${a}</div>
            <span class="user-name">${i.name}</span>
          </div>
          
          <h3 class="story-title">${i.name}</h3>
          <p class="story-description">${this._truncateText(i.description,100)}</p>
          
          <div class="story-meta">
            <div class="story-info">
              <i class="fas fa-calendar-alt"></i>
              <span>${this._formatDate(i.createdAt)}</span>
            </div>
            
            ${i.lat&&i.lon?`<div class="story-info">
                <i class="fas fa-map-marker-alt"></i>
                <span>Lokasi tersedia</span>
              </div>`:""}
          </div>
          
          <div class="story-actions">
            <button class="favorite-btn favorited" data-id="${i.id}">
              <i class="fas fa-bookmark"></i>
            </button>
            <a href="#" class="view-details-btn" data-id="${i.id}">
              View Details
            </a>
          </div>
        </div>
      `,t.appendChild(o),o.querySelector(".view-details-btn").addEventListener("click",n=>{n.preventDefault(),window.selectedStoryId=i.id,window.location.href="#/detail"}),o.querySelector(".favorite-btn").addEventListener("click",async n=>{n.preventDefault();try{await h.removeFromFavorites(i.id),o.remove(),(await h.getFavorites()).length===0&&this.renderFavorites([]),"Notification"in window&&Notification.permission==="granted"&&navigator.serviceWorker.ready.then(d=>{d.showNotification("StoryApps",{body:"Cerita berhasil dihapus dari favorit",icon:"./src/public/icons/icon-192x192.png",badge:"./src/public/icons/badge-96x96.png",vibrate:[100,50,100]})})}catch(l){console.error("Error removing from favorites:",l)}})})}showError(e){this.hideLoading();const t=document.getElementById("error-container");if(!t){console.error("Error container not found");return}t.classList.remove("hidden"),t.innerHTML=`
      <div class="error-content">
        <i class="fas fa-exclamation-triangle fa-3x"></i>
        <h3>Gagal memuat cerita favorit</h3>
        <p>${e}</p>
        <button id="retry-button" class="btn">Coba Lagi</button>
      </div>
    `;const i=document.getElementById("retry-button");i&&i.addEventListener("click",async()=>{this.showLoading();try{const a=await h.getFavorites();this.renderFavorites(a)}catch(a){console.error("Error reloading favorites:",a),this.showError("Gagal memuat cerita favorit: "+a.message)}})}_truncateText(e,t){return e?e.length<=t?e:e.substr(0,t)+"...":""}_formatDate(e){if(!e)return"-";const t={year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"};return new Date(e).toLocaleDateString("id-ID",t)}}const G="modulepreload",q=function(c){return"/"+c},_={},S=function(e,t,i){let a=Promise.resolve();if(t&&t.length>0){document.getElementsByTagName("link");const r=document.querySelector("meta[property=csp-nonce]"),s=(r==null?void 0:r.nonce)||(r==null?void 0:r.getAttribute("nonce"));a=Promise.allSettled(t.map(n=>{if(n=q(n),n in _)return;_[n]=!0;const l=n.endsWith(".css"),d=l?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${n}"]${d}`))return;const u=document.createElement("link");if(u.rel=l?"stylesheet":G,l||(u.as="script"),u.crossOrigin="",u.href=n,s&&u.setAttribute("nonce",s),document.head.appendChild(u),l)return new Promise((y,b)=>{u.addEventListener("load",y),u.addEventListener("error",()=>b(new Error(`Unable to preload CSS for ${n}`)))})}))}function o(r){const s=new Event("vite:preloadError",{cancelable:!0});if(s.payload=r,window.dispatchEvent(s),!s.defaultPrevented)throw r}return a.then(r=>{for(const s of r||[])s.status==="rejected"&&o(s.reason);return e().catch(o)})};class p{static async registerServiceWorker(){if(!("serviceWorker"in navigator))return console.log("Service Worker tidak didukung di browser ini"),null;try{const e=await navigator.serviceWorker.register("./sw.js",{scope:"./"});return console.log("Service Worker berhasil didaftarkan",e),e}catch(e){return console.error("Registrasi Service Worker gagal:",e),null}}static async requestPermission(){if(!("Notification"in window))return console.log("Browser tidak mendukung notifikasi"),!1;const e=await Notification.requestPermission();return e==="denied"?(console.log("Fitur notifikasi tidak diizinkan"),!1):e==="default"?(console.log("Pengguna menutup kotak dialog permintaan izin"),!1):!0}static async getVapidPublicKey(){return"BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk"}static async subscribePushNotification(e){if(!e.active){console.error("Service Worker tidak aktif");return}const t=await this.getVapidPublicKey(),i=this._urlBase64ToUint8Array(t);try{const a=await e.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:i});return console.log("Berhasil melakukan subscribe dengan endpoint:",a.endpoint),await this._sendSubscriptionToServer(a),a}catch(a){return console.error("Gagal melakukan subscribe:",a),null}}static async _sendSubscriptionToServer(e){try{const{AuthConfig:t}=await S(async()=>{const{AuthConfig:s}=await Promise.resolve().then(()=>E);return{AuthConfig:s}},void 0),i=new t,a=btoa(String.fromCharCode(...new Uint8Array(e.getKey("p256dh")))),o=btoa(String.fromCharCode(...new Uint8Array(e.getKey("auth")))),r={endpoint:e.endpoint,keys:{p256dh:a,auth:o}};return await i.subscribeNotification(r),console.log("Berhasil mengirim subscription ke server"),r}catch(t){throw console.error("Gagal mengirim subscription ke server:",t),t}}static async unsubscribePushNotification(e){try{const t=await e.pushManager.getSubscription();if(!t)return console.log("Tidak ada subscription yang aktif"),!1;const{AuthConfig:i}=await S(async()=>{const{AuthConfig:r}=await Promise.resolve().then(()=>E);return{AuthConfig:r}},void 0);await new i().unsubscribeNotification(t.endpoint);const o=await t.unsubscribe();return console.log(o?"Berhasil unsubscribe dari push notification":"Gagal unsubscribe dari push notification"),o}catch(t){return console.error("Error unsubscribing from push notification:",t),!1}}static async getSubscriptionStatus(e){try{return await e.pushManager.getSubscription()!==null}catch(t){return console.error("Error checking subscription status:",t),!1}}static _urlBase64ToUint8Array(e){const t="=".repeat((4-e.length%4)%4),i=(e+t).replace(/-/g,"+").replace(/_/g,"/"),a=window.atob(i),o=new Uint8Array(a.length);for(let r=0;r<a.length;r++)o[r]=a.charCodeAt(r);return o}static showNotification(e,t){if(!("Notification"in window)){console.log("Browser tidak mendukung notifikasi");return}Notification.permission==="granted"?navigator.serviceWorker.ready.then(i=>{i.showNotification(e,t)}):(console.log("Izin notifikasi tidak diberikan"),alert("Anda belum memberikan izin untuk menerima notifikasi."))}static async testNotification(){if(!("Notification"in window))return console.log("Browser tidak mendukung notifikasi"),!1;if(Notification.permission!=="granted")return console.log("Izin notifikasi tidak diberikan"),!1;try{return await(await navigator.serviceWorker.ready).showNotification("Test Notification",{body:"Ini adalah notifikasi test dari StoryApps",icon:"./src/public/icons/icon-192x192.png",badge:"./src/public/icons/badge-96x96.png",vibrate:[100,50,100],tag:"test-notification"}),console.log("Test notification sent successfully"),!0}catch(e){return console.error("Error sending test notification:",e),!1}}static async testPushNotification(){try{const t=await(await navigator.serviceWorker.ready).pushManager.getSubscription();if(!t)return console.log("No push subscription found"),!1;const i="Test push notification from StoryApps",a=new Blob([i],{type:"text/plain"});return console.log("Push subscription details:",{endpoint:t.endpoint,keys:{p256dh:btoa(String.fromCharCode(...new Uint8Array(t.getKey("p256dh")))),auth:btoa(String.fromCharCode(...new Uint8Array(t.getKey("auth"))))}}),console.log("Push subscription is ready for testing"),!0}catch(e){return console.error("Error testing push notification:",e),!1}}}class z{constructor(){this._title="Pengaturan Notifikasi - StoryApps",this._isSubscribed=!1,this._registration=null}async render(){return document.title=this._title,`
            <section class="notification-settings-page page-transition">
                <div class="notification-settings-content">
                    <div class="page-header">
                        <h2>Pengaturan Notifikasi</h2>
                        <p>Kelola preferensi notifikasi Anda</p>
                    </div>

                    <div class="notification-card">
                        <div class="notification-info">
                            <h3>Push Notifications</h3>
                            <p>Terima notifikasi real-time tentang cerita baru dan pembaruan aplikasi</p>
                        </div>
                        
                        <div class="notification-status" id="notification-status">
                            <span class="status-loading">Memeriksa status...</span>
                        </div>
                        
                        <div class="notification-actions">
                            <button id="enable-notifications" class="btn btn-primary">
                                <i class="fas fa-bell"></i>
                                <span>Aktifkan Notifikasi</span>
                            </button>
                            <button id="disable-notifications" class="btn btn-secondary">
                                <i class="fas fa-bell-slash"></i>
                                <span>Nonaktifkan Notifikasi</span>
                            </button>
                            <button id="test-notification" class="btn btn-outline">
                                <i class="fas fa-test-tube"></i>
                                <span>Test Notifikasi</span>
                            </button>
                            <button id="test-push" class="btn btn-outline">
                                <i class="fas fa-rocket"></i>
                                <span>Test Push</span>
                            </button>
                        </div>
                    </div>

                    <div class="notification-help">
                        <h4>Bantuan Notifikasi</h4>
                        <ul>
                            <li>Pastikan browser Anda mendukung notifikasi</li>
                            <li>Izinkan notifikasi saat diminta oleh browser</li>
                            <li>Notifikasi akan muncul bahkan saat aplikasi tidak terbuka</li>
                            <li>Anda dapat mengatur notifikasi di pengaturan browser</li>
                        </ul>
                    </div>
                </div>
            </section>
        `}async afterRender(){if(!m.isLoggedIn()){this._showLoginRequired();return}await this._checkNotificationStatus(),this._setupEventListeners()}async _checkNotificationStatus(){const e=document.getElementById("notification-status"),t=document.getElementById("enable-notifications"),i=document.getElementById("disable-notifications");if(!("Notification"in window)){e.innerHTML='<span class="status-error">Browser tidak mendukung notifikasi</span>',t.disabled=!0,i.disabled=!0;return}if(Notification.permission==="denied"){e.innerHTML='<span class="status-error">Notifikasi diblokir oleh browser</span>',t.disabled=!0,i.disabled=!0;return}if(Notification.permission==="default"){e.innerHTML='<span class="status-inactive">Izin notifikasi belum diberikan</span>',t.disabled=!1,i.disabled=!0;return}if(Notification.permission==="granted")try{const a=await navigator.serviceWorker.ready;await p.getSubscriptionStatus(a)?(e.innerHTML='<span class="status-active">Notifikasi aktif</span>',t.disabled=!0,i.disabled=!1):(e.innerHTML='<span class="status-inactive">Notifikasi tidak aktif</span>',t.disabled=!1,i.disabled=!0)}catch(a){console.error("Error checking subscription status:",a),e.innerHTML='<span class="status-error">Error memeriksa status</span>'}}_setupEventListeners(){const e=document.getElementById("enable-notifications"),t=document.getElementById("disable-notifications"),i=document.getElementById("test-notification"),a=document.getElementById("test-push");e.addEventListener("click",async()=>{try{const o=await navigator.serviceWorker.ready;await p.requestPermission()&&(await p.subscribePushNotification(o),await this._checkNotificationStatus(),this._showSuccessMessage("Notifikasi berhasil diaktifkan!"))}catch(o){console.error("Error enabling notifications:",o),this._showErrorMessage("Gagal mengaktifkan notifikasi: "+o.message)}}),t.addEventListener("click",async()=>{try{const o=await navigator.serviceWorker.ready;await p.unsubscribePushNotification(o),await this._checkNotificationStatus(),this._showSuccessMessage("Notifikasi berhasil dinonaktifkan!")}catch(o){console.error("Error disabling notifications:",o),this._showErrorMessage("Gagal menonaktifkan notifikasi: "+o.message)}}),i.addEventListener("click",async()=>{try{await p.testNotification()?this._showSuccessMessage("Test notifikasi berhasil dikirim!"):this._showErrorMessage("Gagal mengirim test notifikasi")}catch(o){console.error("Error testing notification:",o),this._showErrorMessage("Error testing notification: "+o.message)}}),a.addEventListener("click",async()=>{try{await p.testPushNotification()?this._showSuccessMessage("Push subscription siap untuk testing!"):this._showErrorMessage("Gagal test push notification")}catch(o){console.error("Error testing push notification:",o),this._showErrorMessage("Error testing push notification: "+o.message)}})}_showLoginRequired(){const e=document.getElementById("notification-status");e.innerHTML=`
            <div class="status-error">
                <i class="fas fa-exclamation-triangle"></i>
                <span>Silakan login terlebih dahulu</span>
            </div>
        `}_showNotSupported(){const e=document.getElementById("notification-status");e.innerHTML=`
            <div class="status-error">
                <i class="fas fa-exclamation-triangle"></i>
                <span>Browser tidak mendukung notifikasi push</span>
            </div>
        `}_showError(e){const t=document.getElementById("notification-status");t.innerHTML=`
            <div class="status-error">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${e}</span>
            </div>
        `}_showSuccessMessage(e){const t=document.createElement("div");t.className="notification-success",t.innerHTML=`
            <i class="fas fa-check-circle"></i>
            <span>${e}</span>
        `,document.body.appendChild(t),setTimeout(()=>{t.remove()},3e3)}_showErrorMessage(e){const t=document.createElement("div");t.className="notification-error",t.innerHTML=`
            <i class="fas fa-exclamation-circle"></i>
            <span>${e}</span>
        `,document.body.appendChild(t),setTimeout(()=>{t.remove()},5e3)}beforeUnload(){}}class j{constructor(){this._title="Offline - StoryApps"}async render(){return document.title=this._title,`
            <section class="offline-page page-transition">
                <div class="coordinator-layout">
                    <div class="offline-content">
                        <div class="offline-icon">
                            <i class="fas fa-wifi-slash"></i>
                        </div>
                        
                        <h2>Anda Sedang Offline</h2>
                        <p>Koneksi internet tidak tersedia. Beberapa fitur mungkin terbatas.</p>
                        
                        <div class="offline-actions">
                            <button id="retry-connection" class="btn btn-primary">
                                <i class="fas fa-sync-alt"></i> Coba Lagi
                            </button>
                            <a href="#/" class="btn btn-secondary">
                                <i class="fas fa-home"></i> Kembali ke Beranda
                            </a>
                        </div>
                        
                        <div class="offline-info">
                            <h3>Yang Dapat Anda Lakukan:</h3>
                            <ul>
                                <li>Melihat cerita yang sudah dimuat sebelumnya</li>
                                <li>Melihat cerita favorit yang tersimpan</li>
                                <li>Navigasi antar halaman yang sudah dikunjungi</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        `}async afterRender(){this._bindEvents(),this._checkConnectionStatus()}_bindEvents(){const e=document.getElementById("retry-connection");e&&e.addEventListener("click",()=>{this._retryConnection()}),window.addEventListener("online",()=>{this._handleOnline()}),window.addEventListener("offline",()=>{this._handleOffline()})}_retryConnection(){const e=document.getElementById("retry-connection");e.disabled=!0,e.innerHTML='<div class="loader"></div> Memeriksa...',setTimeout(()=>{navigator.onLine?this._handleOnline():(e.disabled=!1,e.innerHTML='<i class="fas fa-sync-alt"></i> Coba Lagi',this._showMessage("Koneksi masih tidak tersedia","error"))},2e3)}_handleOnline(){this._showMessage("Koneksi tersedia! Mengalihkan...","success"),setTimeout(()=>{window.location.href="#/",window.location.reload()},1500)}_handleOffline(){this._showMessage("Koneksi terputus","error")}_checkConnectionStatus(){navigator.onLine&&this._handleOnline()}_showMessage(e,t="info"){const i=document.querySelector(".connection-message");i&&i.remove();const a=document.createElement("div");a.className=`connection-message connection-message-${t}`,a.innerHTML=`
            <i class="fas fa-${t==="success"?"check-circle":t==="error"?"exclamation-triangle":"info-circle"}"></i>
            <span>${e}</span>
        `;const o=document.querySelector(".offline-content");o.insertBefore(a,o.firstChild),setTimeout(()=>{a.parentNode&&a.parentNode.removeChild(a)},3e3)}beforeUnload(){window.removeEventListener("online",this._handleOnline),window.removeEventListener("offline",this._handleOffline)}}const g={"/":{view:C},"/add":{view:M},"/map":{view:D},"/detail":{view:R},"/login":{view:$},"/register":{view:U},"/favorites":{view:H},"/notifications":{view:z},"/offline":{view:j},"/404":{view:F}};class W{static parseActiveUrlWithCombiner(){const e=window.location.hash.slice(1).toLowerCase();return this._urlCombiner(this._urlSplitter(e))}static parseActiveUrlWithoutCombiner(){const e=window.location.hash.slice(1).toLowerCase();return this._urlSplitter(e)}static _urlSplitter(e){const t=e.split("/");return{resource:t[1]||null,id:t[2]||null,verb:t[3]||null}}static _urlCombiner(e){return e.resource?`/${e.resource}`:"/"}}class V{static onOnline(e){window.addEventListener("online",e)}static onOffline(e){window.addEventListener("offline",e)}static isOnline(){return navigator.onLine}}class K{static init(){this.deferredPrompt=null,this._setupEventListeners()}static _setupEventListeners(){window.addEventListener("beforeinstallprompt",e=>{e.preventDefault(),this.deferredPrompt=e,this._showInstallBanner()}),document.addEventListener("DOMContentLoaded",()=>{const e=document.getElementById("install-pwa"),t=document.getElementById("close-banner");e&&e.addEventListener("click",function(){window.location.href="https://story-apps-susah.netlify.app/"}),t&&t.addEventListener("click",()=>{this._hideInstallBanner()})}),window.addEventListener("appinstalled",()=>{this._hideInstallBanner(),this.deferredPrompt=null,console.log("PWA was installed")})}static _showInstallBanner(){const e=document.getElementById("pwa-install-banner");e&&this.deferredPrompt&&e.classList.add("show")}static _hideInstallBanner(){const e=document.getElementById("pwa-install-banner");e&&e.classList.remove("show")}static async _installPwa(){if(!this.deferredPrompt)return;this.deferredPrompt.prompt();const e=await this.deferredPrompt.userChoice;this.deferredPrompt=null,e.outcome==="accepted"?console.log("User accepted the install prompt"):console.log("User dismissed the install prompt"),this._hideInstallBanner()}}window.selectedStoryId=null;window.routes=g;class J{constructor(){this._currentPage=null,this._initializeApp()}async _initializeApp(){console.log("Initializing app..."),await this._initIndexedDB(),await this._initServiceWorker(),V.init(),K.init(),await this._subscribeToPushNotification(),this._initMobileNav(),this._checkAuthStatus(),await this._handleRoute(),window.addEventListener("hashchange",()=>{this._cleanupCurrentPage(),this._handleRoute()}),window.addEventListener("beforeunload",()=>{this._cleanupCurrentPage()}),document.addEventListener("click",e=>{e.target.tagName==="A"&&e.target.href.includes("#/")&&document.startViewTransition&&(e.preventDefault(),document.startViewTransition(()=>{window.location.href=e.target.href}))})}async _initServiceWorker(){try{if(console.log("Initializing Service Worker..."),"serviceWorker"in navigator){const e=await navigator.serviceWorker.register("/sw.js",{scope:"/"});return console.log("Service Worker registered successfully:",e),e.addEventListener("updatefound",()=>{console.log("New service worker found, updating...")}),m.isLoggedIn()&&await p.requestPermission()&&e&&await p.subscribePushNotification(e),e}else return console.warn("Service Worker not supported"),null}catch(e){return console.error("Error initializing service worker:",e),null}}async _initIndexedDB(){try{await h.openDB(),console.log("IndexedDB initialized successfully")}catch(e){console.error("Failed to initialize IndexedDB:",e)}}_initMobileNav(){const e=document.getElementById("menu"),t=document.getElementById("drawer");if(!e||!t){console.error("Menu button or drawer not found");return}e.addEventListener("click",a=>{a.stopPropagation(),t.classList.toggle("open")}),document.addEventListener("click",a=>{t.classList.contains("open")&&!t.contains(a.target)&&t.classList.remove("open")}),document.querySelectorAll(".nav-item a").forEach(a=>{a.addEventListener("click",()=>{t.classList.remove("open")})})}_checkAuthStatus(){var l,d,u,y;console.log("Checking auth status...");const e=m.isLoggedIn(),t=document.getElementById("login-menu"),i=document.getElementById("register-menu"),a=document.getElementById("logout-menu"),o=(l=document.querySelector('.nav-item a[href="#/favorites"]'))==null?void 0:l.parentElement,r=(d=document.querySelector('.nav-item a[href="#/add"]'))==null?void 0:d.parentElement,s=(u=document.querySelector('.nav-item a[href="#/map"]'))==null?void 0:u.parentElement,n=(y=document.querySelector('.nav-item a[href="#/notifications"]'))==null?void 0:y.parentElement;if(!t||!i||!a){console.error("Menu items not found");return}e?(console.log("User is logged in"),t.classList.add("hidden"),i.classList.add("hidden"),a.classList.remove("hidden"),o&&o.classList.remove("hidden"),r&&r.classList.remove("hidden"),s&&s.classList.remove("hidden"),n&&n.classList.remove("hidden"),this._subscribeToPushNotification()):(console.log("User is not logged in"),t.classList.remove("hidden"),i.classList.remove("hidden"),a.classList.add("hidden"),o&&o.classList.add("hidden"),r&&r.classList.add("hidden"),s&&s.classList.add("hidden"),n&&n.classList.add("hidden")),a.addEventListener("click",b=>{b.preventDefault(),this._handleLogout()})}async _subscribeToPushNotification(){try{if("serviceWorker"in navigator){const e=await navigator.serviceWorker.ready;await p.requestPermission()&&e&&await p.subscribePushNotification(e)}}catch(e){console.error("Error subscribing to push notification:",e)}}async _handleLogout(){this._cleanupCurrentPage(),m.logout();try{await h.clearStories(),console.log("Stories cleared from IndexedDB after logout")}catch(e){console.error("Error clearing stories from IndexedDB:",e)}window.location.href="#/",window.location.reload()}_cleanupCurrentPage(){this._currentPage&&typeof this._currentPage.beforeUnload=="function"&&(console.log("Cleaning up current page..."),this._currentPage.beforeUnload(),this._currentPage=null)}async _handleRoute(){console.log("Handling route..."),console.log("Current hash:",window.location.hash),this._cleanupCurrentPage();const e=window.location.hash.slice(1).split("/");e.length>2&&e[1]==="detail"&&(window.selectedStoryId=e[2],window.history.replaceState(null,null,"#/detail"));const t=W.parseActiveUrlWithCombiner();console.log("Parsed URL:",t),console.log("Available routes:",Object.keys(g)),console.log("Current URL:",t);let i;g[t]?i=g[t]:(console.log("Route not found, redirecting to 404 page"),i=g["/404"]),console.log("Page to render:",i);try{if((t==="/login"||t==="/register")&&m.isLoggedIn()){console.log("User is logged in, redirecting to home"),window.location.href="#/";return}if((t==="/add"||t==="/map"||t==="/favorites"||t==="/notifications")&&!m.isLoggedIn()){console.log("Protected route, redirecting to login"),window.location.href="#/login";return}const a=document.querySelector("#content");if(!a){console.error("Content container not found");return}a.innerHTML="",this._currentPage=new i.view,console.log("View instantiated");const o=await this._currentPage.render();console.log("Content rendered"),a.innerHTML=o,console.log("Content injected into DOM"),await this._currentPage.afterRender(),console.log("afterRender completed"),document.getElementById("main-content").focus()}catch(a){console.error("Error rendering page:",a)}}}document.addEventListener("DOMContentLoaded",()=>{console.log("DOM fully loaded"),window.app=new J,console.log("App initialized:",window.app),console.log("Routes available:",Object.keys(g))});
