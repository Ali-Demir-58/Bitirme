// Global Auth Helper

let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    await initializeAuth();
});

async function initializeAuth() {
    if (typeof supabaseClient === 'undefined') {
        console.warn('Supabase client bulunamadı.');
        return;
    }

    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {
        console.error('Session okunamadı:', error);
        return;
    }

    currentUser = data.session?.user || null;

    renderAuthLinks();

    // Analysis sayfası kişisel veri tuttuğu için giriş zorunlu olsun.
    const path = window.location.pathname.toLowerCase();

    const isAnalysisPage =
        path.includes('analysis.html') ||
        path.endsWith('/analysis');

    if (isAnalysisPage && !currentUser) {
        window.location.href = 'login.html';
    }
}

function renderAuthLinks() {
    const desktopNav = document.querySelector('nav .hidden.md\\:flex');
    const mobileMenu = document.querySelector('.mobile-menu-panel');

    if (desktopNav && !desktopNav.dataset.authReady) {
        desktopNav.dataset.authReady = 'true';

        if (currentUser) {
            desktopNav.insertAdjacentHTML('beforeend', `
                <span class="text-sm text-gray-500 font-medium max-w-[180px] truncate">
                    ${currentUser.email}
                </span>
                <button onclick="logoutUser()"
                    class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold">
                    Çıkış Yap
                </button>
            `);
        } else {
            desktopNav.insertAdjacentHTML('beforeend', `
                <a href="login.html" class="text-gray-700 hover:text-blue-600 font-medium">Giriş Yap</a>
                <a href="register.html"
                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold">
                    Kayıt Ol
                </a>
            `);
        }
    }

    if (mobileMenu && !mobileMenu.dataset.authReady) {
        mobileMenu.dataset.authReady = 'true';

        if (currentUser) {
            mobileMenu.insertAdjacentHTML('beforeend', `
                <div class="px-5 py-3 text-xs text-gray-500 border-t border-gray-100 truncate">
                    ${currentUser.email}
                </div>
                <button onclick="logoutUser()"
                    class="w-full text-left block px-5 py-3 text-red-600 font-semibold hover:bg-red-50">
                    Çıkış Yap
                </button>
            `);
        } else {
            mobileMenu.insertAdjacentHTML('beforeend', `
                <a href="login.html" class="block px-5 py-3 text-gray-700 hover:bg-gray-50">Giriş Yap</a>
                <a href="register.html" class="block px-5 py-3 text-blue-600 font-semibold bg-blue-50">Kayıt Ol</a>
            `);
        }
    }
}

async function logoutUser() {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        alert('Çıkış yapılırken hata oluştu.');
        console.error(error);
        return;
    }

    window.location.href = 'index.html';
}

async function getCurrentUser() {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {
        console.error(error);
        return null;
    }

    return data.session?.user || null;
}

window.logoutUser = logoutUser;
window.getCurrentUser = getCurrentUser;