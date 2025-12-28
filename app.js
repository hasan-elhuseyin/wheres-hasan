function getNextVisitWindow(now) {
    const nextSunday = new Date(now);
    const day = nextSunday.getDay(); // 0 = Sunday

    const daysUntilSunday = (7 - day) % 7;
    nextSunday.setDate(nextSunday.getDate() + daysUntilSunday);
    nextSunday.setHours(14, 0, 0, 0);

    if (daysUntilSunday === 0 && now.getHours() >= 18) {
        // Already past today's visit → next Sunday
        nextSunday.setDate(nextSunday.getDate() + 7);
    }

    const visitEnd = new Date(nextSunday);
    visitEnd.setHours(22, 0, 0, 0);

    return { start: nextSunday, end: visitEnd };
}

function update() {
    const now = new Date();
    const { start, end } = getNextVisitWindow(now);

    const status = document.getElementById("status");
    const timer = document.getElementById("timer");
    const bar = document.getElementById("progress-bar");

    if (now >= start && now <= end) {
        status.textContent = "حسان هنا";
        timer.textContent = "🎉🥳🎉";
        bar.style.width = "100%";
        return;
    }

    const diff = start - now;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    timer.textContent =
        String(hours).padStart(2, "0") + ":" +
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");

    status.textContent = "الوقت المتبقي حتى الزيارة القادمة";

    const lastEnd = new Date(start);
    lastEnd.setDate(lastEnd.getDate() - 7);
    lastEnd.setHours(18, 0, 0, 0);

    const total = start - lastEnd;
    const passed = now - lastEnd;
    const progress = Math.min(100, Math.max(0, (passed / total) * 100));

    bar.style.width = progress + "%";
}

// Base URL for photos (GitHub raw)
const PHOTO_BASE_URL =
    "https://raw.githubusercontent.com/hasan-elhuseyin/wheres-hasan/main/src/photos/";

const photoBtn = document.getElementById("photoBtn");
const overlay = document.getElementById("photoOverlay");
const img = document.getElementById("dailyPhoto");
const closePhotoBtn = document.getElementById("closePhotoBtn");

// Generate today's photo filename
function getTodayPhotoUrl() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const filename = `photo_${year}-${month}-${day}.jpg`;
    return PHOTO_BASE_URL + filename;
}

// Load photo and bypass cache
async function loadPhoto() {
    const url = getTodayPhotoUrl() + "?v=" + Date.now(); // unique query to bypass cache
    try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) throw new Error("Photo not found for today");

        const blob = await response.blob();

        if (img.src.startsWith("blob:")) {
            URL.revokeObjectURL(img.src);
        }

        const objectUrl = URL.createObjectURL(blob);
        img.src = objectUrl;
        overlay.classList.remove("hidden");
    } catch (err) {
        console.warn("No photo for today, showing fallback", err);
        img.src = "fallback.jpg"; // local fallback in your app folder
        overlay.classList.remove("hidden");
    }
}

// Event listeners
photoBtn.addEventListener("click", loadPhoto);
closePhotoBtn.addEventListener("click", () => {
    overlay.classList.add("hidden");
});

// Handle BACK button on webOS remote
document.addEventListener("keydown", (e) => {
    const isBack =
        e.key === "Backspace" ||
        e.key === "Escape" ||
        e.keyCode === 461;

    if (!isBack) return;

    if (!overlay.classList.contains("hidden")) {
        overlay.classList.add("hidden");
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
    }
});

// Start the timer
setInterval(update, 1000);
update();
