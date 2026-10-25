async function downloadRandomSubset() {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    const zip = new JSZip();

    const counts = {
        hair: 10,
        base: 1,
        dress: 8,
        bang: 6,
        face: 9,
        glass: 2  // glass0.png と glass1.png
    };

    const itemsPerZip = 80; // 今回はテストとして80枚

    // --- 1. すべての組み合わせ（480通り）を作る ---
    let allTrios = [];
    for (let h = 1; h <= counts.hair; h++) {
        for (let d = 1; d <= counts.dress; d++) {
            for (let bg = 1; bg <= counts.bang; bg++) {
                allTrios.push({ h, d, bg });
            }
        }
    }

    // --- 2. ドレスが偏らないように80枚をピックアップ ---
    let dressGroups = {};
    for (let d = 1; d <= counts.dress; d++) {
        dressGroups[d] = allTrios.filter(trio => trio.d === d);
        dressGroups[d].sort(() => Math.random() - 0.5);
    }

    let selectedTrios = [];
    const takeCount = itemsPerZip / counts.dress; // 80 ÷ 8 = 各ドレス10枚ずつ
    for (let d = 1; d <= counts.dress; d++) {
        const items = dressGroups[d].splice(0, takeCount);
        selectedTrios.push(...items);
    }
    selectedTrios.sort(() => Math.random() - 0.5);

    // --- 3. 画像の読み込みと描画 ---
    let count = 0;
    for (const trio of selectedTrios) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const f = Math.floor(Math.random() * counts.face) + 1;
        const glassWeights = { 0: 70, 1: 30 };
        const rand = Math.random() * (glassWeights[0] + glassWeights[1]);
        let g = (rand < glassWeights[0]) ? 0 : 1;

        // ★【重要】フォルダ名が "img" のため、パスを "img/..." に修正しています
        const sources = [
            `img/hair/hair${trio.h}.png`,
            `img/base/base.png`,
            `img/dress/dress${trio.d}.png`,
            `img/bang/bang${trio.bg}.png`,
            `img/face/face${f.png || f}.png` // ※修正: face${f}.png
        ];

        // 正しいfaceのパス記述
        sources[4] = `img/face/face${f}.png`;

        if (g !== 0) {
            sources.push(`img/glass/glass${g}.png`);
        }

        // 1枚ずつ確実に画像を読み込んで描画する
        for (const src of sources) {
            try {
                const img = await loadImage(src);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            } catch (e) {
                console.error("画像が見つかりません: " + src);
            }
        }

        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        count++;
        zip.file(`character_${count}.png`, blob);
    }

    // --- 4. ZIPダウンロード ---
    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = `characters_part_1.zip`;
    link.click();

    alert(`80枚のZIP作成が完了しました！`);
}

// 画像読み込み用（エラーをしっかりキャッチするように強化）
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(new Error("Failed to load image: " + src));
        img.src = src;
    });
}
