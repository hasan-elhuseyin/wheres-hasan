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

    // Progress calculation
    const lastEnd = new Date(start);
    lastEnd.setDate(lastEnd.getDate() - 7);
    lastEnd.setHours(18, 0, 0, 0);

    const total = start - lastEnd;
    const passed = now - lastEnd;
    const progress = Math.min(100, Math.max(0, (passed / total) * 100));

    bar.style.width = progress + "%";
}

setInterval(update, 1000);
update();
