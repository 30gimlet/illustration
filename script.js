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

    let count = 0;
    // テストとして、最初は最初の1枚だけ試す（全480枚だと時間がかかるため）
    // うまくいったら下のループ条件を元に戻せます
    for (const combo of allCombinations) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const sources = [
            `img/hair/hair${combo.h}.png`,
            `img/base/base.png`,
            `img/dress/dress${combo.d}.png`,
            `img/bang/bang${combo.bg}.png`,
            `img/face/face${combo.f}.png`
        ];

        if (combo.g !== 0) {
            sources.push(`img/glass/glass${combo.g}.png`);
        }

        for (const src of sources) {
            try {
                const img = await loadImage(src);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            } catch (e) {
                // 万が一画像が見つからない場合、アラートでどの画像が原因か教えてくれます！
                alert("画像が見つかりません: " + src);
                return; // 処理をストップ
            }
        }

        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        count++;
        zip.file(`character_${count}.png`, blob);
        
        // 【テスト用】まずは最初の1枚がちゃんと生成できるか確かめるため、1枚作ったらループを抜けます
        break; 
    }

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = `test_character.zip`;
    link.click();

    alert(`テスト出力が完了しました！`);
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(new Error("Failed to load: " + src));
        img.src = src;
    });
}
