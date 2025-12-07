// ===== 프로젝트 백업 스크립트 =====
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_DIR = __dirname;
const BACKUP_BASE_DIR = path.join(PROJECT_DIR, 'backups');

// 현재 날짜/시간으로 백업 폴더명 생성
function getBackupFolderName() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');

    return `backup_${year}${month}${day}_${hour}${minute}${second}`;
}

// 디렉토리 복사 (재귀적)
function copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        // node_modules는 제외
        if (entry.name === 'node_modules' || entry.name === 'backups') {
            continue;
        }

        if (entry.isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// 백업 실행
function createBackup() {
    console.log('🔄 백업 시작...\n');

    // 백업 디렉토리 생성
    if (!fs.existsSync(BACKUP_BASE_DIR)) {
        fs.mkdirSync(BACKUP_BASE_DIR, { recursive: true });
    }

    const backupFolderName = getBackupFolderName();
    const backupPath = path.join(BACKUP_BASE_DIR, backupFolderName);

    console.log(`📁 백업 위치: ${backupPath}\n`);

    // 프로젝트 복사
    console.log('📋 파일 복사 중...');
    copyDirectory(PROJECT_DIR, backupPath);

    // 백업 정보 파일 생성
    const backupInfo = {
        timestamp: new Date().toISOString(),
        backupName: backupFolderName,
        projectPath: PROJECT_DIR,
        files: []
    };

    // 백업된 파일 목록 수집
    function collectFiles(dir, baseDir = dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (let entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativePath = path.relative(baseDir, fullPath);

            if (entry.isDirectory()) {
                collectFiles(fullPath, baseDir);
            } else {
                const stats = fs.statSync(fullPath);
                backupInfo.files.push({
                    path: relativePath,
                    size: stats.size,
                    modified: stats.mtime
                });
            }
        }
    }

    collectFiles(backupPath);

    // 백업 정보 저장
    fs.writeFileSync(
        path.join(backupPath, 'BACKUP_INFO.json'),
        JSON.stringify(backupInfo, null, 2)
    );

    console.log('✅ 백업 완료!\n');
    console.log('📊 백업 통계:');
    console.log(`   총 파일 수: ${backupInfo.files.length}`);
    console.log(`   총 크기: ${(backupInfo.files.reduce((sum, f) => sum + f.size, 0) / 1024).toFixed(2)} KB`);
    console.log(`   백업 시간: ${new Date().toLocaleString('ko-KR')}`);
    console.log('');

    // 백업 목록 파일 업데이트
    updateBackupList();

    return backupPath;
}

// 백업 목록 업데이트
function updateBackupList() {
    const backupListPath = path.join(BACKUP_BASE_DIR, 'BACKUP_LIST.md');

    const backups = fs.readdirSync(BACKUP_BASE_DIR, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => {
            const backupPath = path.join(BACKUP_BASE_DIR, entry.name);
            const infoPath = path.join(backupPath, 'BACKUP_INFO.json');

            if (fs.existsSync(infoPath)) {
                const info = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
                return {
                    name: entry.name,
                    timestamp: info.timestamp,
                    fileCount: info.files.length,
                    size: info.files.reduce((sum, f) => sum + f.size, 0)
                };
            }
            return null;
        })
        .filter(b => b !== null)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    let content = '# 📦 백업 목록\n\n';
    content += `총 백업 개수: ${backups.length}\n\n`;
    content += '| 백업 이름 | 날짜/시간 | 파일 수 | 크기 |\n';
    content += '|----------|----------|---------|------|\n';

    backups.forEach(backup => {
        const date = new Date(backup.timestamp).toLocaleString('ko-KR');
        const size = (backup.size / 1024).toFixed(2) + ' KB';
        content += `| ${backup.name} | ${date} | ${backup.fileCount} | ${size} |\n`;
    });

    content += '\n## 📝 백업 복원 방법\n\n';
    content += '```bash\n';
    content += '# 백업 폴더의 내용을 프로젝트 루트로 복사\n';
    content += 'xcopy /E /I /Y backups\\[백업폴더명]\\* .\n';
    content += '```\n';

    fs.writeFileSync(backupListPath, content);
}

// 오래된 백업 삭제 (10개 이상 유지 안 함)
function cleanOldBackups(keepCount = 10) {
    const backups = fs.readdirSync(BACKUP_BASE_DIR, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => ({
            name: entry.name,
            path: path.join(BACKUP_BASE_DIR, entry.name),
            time: fs.statSync(path.join(BACKUP_BASE_DIR, entry.name)).mtime
        }))
        .sort((a, b) => b.time - a.time);

    if (backups.length > keepCount) {
        console.log(`\n🗑️  오래된 백업 삭제 중... (${backups.length - keepCount}개)`);

        for (let i = keepCount; i < backups.length; i++) {
            const backup = backups[i];
            console.log(`   삭제: ${backup.name}`);
            fs.rmSync(backup.path, { recursive: true, force: true });
        }

        console.log('✅ 정리 완료\n');
    }
}

// 메인 실행
if (require.main === module) {
    try {
        const backupPath = createBackup();
        cleanOldBackups(10);

        console.log('💡 백업 복원 방법:');
        console.log(`   xcopy /E /I /Y "${backupPath}\\*" "${PROJECT_DIR}"`);
        console.log('');
        console.log('📋 백업 목록 확인:');
        console.log(`   type "${path.join(BACKUP_BASE_DIR, 'BACKUP_LIST.md')}"`);
        console.log('');
    } catch (error) {
        console.error('❌ 백업 실패:', error.message);
        process.exit(1);
    }
}

module.exports = { createBackup, cleanOldBackups };
