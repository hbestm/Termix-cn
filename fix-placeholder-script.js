import { readFileSync, writeFileSync } from 'fs';

// 读取JSON文件
const en = JSON.parse(readFileSync('d:\\github\\Termix-cn\\src\\locales\\en.json', 'utf8'));
const zh = JSON.parse(readFileSync('d:\\github\\Termix-cn\\src\\locales\\zh.json', 'utf8'));

// 修复占位符不匹配的问题
function fixPlaceholders(obj1, obj2, path = '') {
    for (const key in obj1) {
        if (!obj2[key]) continue;
        
        const fullPath = `${path}.${key}`.slice(1);
        
        if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
            fixPlaceholders(obj1[key], obj2[key], fullPath);
        } else if (typeof obj1[key] === 'string' && typeof obj2[key] === 'string') {
            const enPlaceholders = (obj1[key].match(/\{\{([^}]+)\}\}/g) || []).map(p => p.replace(/\{\{|\}\}/g, ''));
            const zhPlaceholders = (obj2[key].match(/\{\{([^}]+)\}\}/g) || []).map(p => p.replace(/\{\{|\}\}/g, ''));
            
            // 只有当占位符数量匹配时才进行修复
            if (enPlaceholders.length === zhPlaceholders.length && enPlaceholders.length > 0) {
                let fixedZh = obj2[key];
                
                // 将zh中的占位符替换为en中的对应占位符
                for (let i = 0; i < enPlaceholders.length; i++) {
                    fixedZh = fixedZh.replace(new RegExp(`\{\{${zhPlaceholders[i]}\}\}`, 'g'), `{{${enPlaceholders[i]}}}`);
                }
                
                    // 更新zh对象
                try {
                    const keys = fullPath.split('.');
                    let current = zh;
                    for (let i = 0; i < keys.length - 1; i++) {
                        if (!current[keys[i]]) {
                            console.error(`Path not found in zh: ${fullPath}`);
                            return;
                        }
                        current = current[keys[i]];
                    }
                    
                    if (!current) {
                        console.error(`Path not found in zh: ${fullPath}`);
                        return;
                    }
                    
                    current[keys[keys.length - 1]] = fixedZh;
                    
                    console.log(`Fixed placeholders for: ${fullPath}`);
                    console.log(`  EN: ${obj1[key]}`);
                    console.log(`  ZH: ${fixedZh}`);
                    console.log('---');
                } catch (error) {
                    console.error(`Error updating path ${fullPath}:`, error);
                }
            }
        }
    }
}

// 开始修复
console.log('Starting placeholder fix...');
fixPlaceholders(en, zh);

// 保存修复后的JSON文件
try {
    writeFileSync('./src/locales/zh.json.fixed', JSON.stringify(zh, null, 2), 'utf8');
    console.log('Placeholder fix completed!');
    console.log('Fixed file saved to: ./src/locales/zh.json.fixed');
} catch (error) {
    console.error('Error saving fixed file:', error);
    // 尝试保存到当前目录
    writeFileSync('./zh.json.fixed', JSON.stringify(zh, null, 2), 'utf8');
    console.log('Fixed file saved to: ./zh.json.fixed');
}
