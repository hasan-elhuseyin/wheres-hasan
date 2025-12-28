function getNextVisitWindow(now) {
    const nextSunday = new Date(now);
    const day = nextSunday.getDay(); // 0 = Sunday

    const daysUntilSunday = (7 - day) % 7;
    nextSunday.setDate(nextSunday.getDate() + daysUntilSunday);
    nextSunday.setHours(14, 0, 0, 0);

    if (daysUntilSunday === 0 && now.getHours() >= 18) {
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

// Single filename URL
const PHOTO_URL =
    "https://raw.githubusercontent.com/hasan-elhuseyin/wheres-hasan/main/src/photo_of_the_day.jpg";

const photoBtn = document.getElementById("photoBtn");
const overlay = document.getElementById("photoOverlay");
const img = document.getElementById("dailyPhoto");
const closePhotoBtn = document.getElementById("closePhotoBtn");

// Function to load photo and completely bypass cache
async function loadPhoto() {
    try {
        // Append a unique timestamp to force fetch a new copy
        const uniqueUrl = PHOTO_URL + "?v=" + Date.now();

        const response = await fetch(uniqueUrl, { cache: "no-store" });

        if (!response.ok) throw new Error("Failed to fetch image");

        const blob = await response.blob();

        // Revoke previous object URL to avoid memory leaks
        if (img.src.startsWith("blob:")) {
            URL.revokeObjectURL(img.src);
        }

        const objectUrl = URL.createObjectURL(blob);
        img.src = objectUrl;
        overlay.classList.remove("hidden");
    } catch (err) {
        console.error("Failed to load photo of the day", err);
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
