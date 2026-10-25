async function downloadAll480() {
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

    // --- 1. すべての組み合わせ（480通り）のリストを作る ---
    let allCombinations = [];

    for (let h = 1; h <= counts.hair; h++) {
        for (let b = 1; b <= counts.base; b++) {
            for (let d = 1; d <= counts.dress; d++) {
                for (let bg = 1; bg <= counts.bang; bg++) {
                    for (let f = 1; f <= counts.face; f++) {
                        for (let g = 0; g < counts.glass; g++) {
                            allCombinations.push({ h, b, d, bg, f, g });
                        }
                    }
                }
            }
        }
    }

    // 480枚すべてを順番に処理
    let count = 0;
    for (const combo of allCombinations) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 読み込む画像のパスリスト（すべて img/ フォルダ内を参照）
        const sources = [
            `img/hair/hair${combo.h}.png`,
            `img/base/base.png`,
            `img/dress/dress${combo.d}.png`,
            `img/bang/bang${combo.bg}.png`,
            `img/face/face${combo.f}.png`
        ];

        // glass0以外（メガネあり）の場合のみ追加
        if (combo.g !== 0) {
            sources.push(`img/glass/glass${combo.g}.png`);
        }

        // 1枚ずつキャンバスに描画していく
        for (const src of sources) {
            try {
                const img = await loadImage(src);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            } catch (e) {
                console.error("画像読み込みエラー: " + src);
            }
        }

        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        count++;
        zip.file(`character_${count}.png`, blob);
    }

    // ZIPとしてダウンロード
    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = `all_480_characters.zip`;
    link.click();

    alert(`全480枚のZIP作成が完了しました！`);
}

// 画像を非同期で読み込む関数
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(new Error("Failed to load: " + src));
        img.src = src;
    });
}
