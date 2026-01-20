import { readFileSync } from 'fs';

// 读取JSON文件
const en = JSON.parse(readFileSync('d:\\github\\Termix-cn\\src\\locales\\en.json', 'utf8'));
const zh = JSON.parse(readFileSync('d:\\github\\Termix-cn\\src\\locales\\zh.json', 'utf8'));

// 用于存储发现的问题
const issues = [];

// 检查占位符是否匹配
function checkPlaceholders(enValue, zhValue, path) {
    if (typeof enValue !== 'string' || typeof zhValue !== 'string') {
        return;
    }
    
    // 提取占位符
    const enPlaceholders = (enValue.match(/\{\{([^}]+)\}\}/g) || []).map(p => p.replace(/\{\{|\}\}/g, ''));
    const zhPlaceholders = (zhValue.match(/\{\{([^}]+)\}\}/g) || []).map(p => p.replace(/\{\{|\}\}/g, ''));
    
    // 检查占位符数量是否匹配
    if (enPlaceholders.length !== zhPlaceholders.length) {
        issues.push({
            path,
            issue: 'Placeholders count mismatch',
            en: enValue,
            zh: zhValue,
            enPlaceholders,
            zhPlaceholders
        });
        return;
    }
    
    // 检查占位符名称是否匹配（忽略顺序）
    const enSet = new Set(enPlaceholders);
    const zhSet = new Set(zhPlaceholders);
    
    if (enSet.size !== zhSet.size || !Array.from(enSet).every(p => zhSet.has(p))) {
        issues.push({
            path,
            issue: 'Placeholders mismatch',
            en: enValue,
            zh: zhValue,
            enPlaceholders,
            zhPlaceholders
        });
    }
}

// 递归遍历JSON对象
function traverse(obj1, obj2, path = '') {
    for (const key in obj1) {
        if (obj2[key] === undefined) {
            issues.push({
                path: `${path}.${key}`.slice(1),
                issue: 'Missing translation',
                en: obj1[key],
                zh: undefined
            });
            continue;
        }
        
        const currentPath = `${path}.${key}`.slice(1);
        
        if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
            traverse(obj1[key], obj2[key], currentPath);
        } else if (typeof obj1[key] === 'string' && typeof obj2[key] === 'string') {
            checkPlaceholders(obj1[key], obj2[key], currentPath);
            
            // 检查是否有明显的翻译错误
            if (obj2[key].includes('{{') && !obj2[key].includes('}}')) {
                issues.push({
                    path: currentPath,
                    issue: 'Unclosed placeholder',
                    en: obj1[key],
                    zh: obj2[key]
                });
            }
            
            // 检查是否有明显的乱码或不自然的翻译
            if (/[\u3000-\u303f\uff00-\uffef\u4e00-\u9fa5]{50,}/.test(obj2[key])) {
                issues.push({
                    path: currentPath,
                    issue: 'Potential translation issue (long Chinese text)',
                    en: obj1[key],
                    zh: obj2[key]
                });
            }
        } else if (typeof obj1[key] !== typeof obj2[key]) {
            issues.push({
                path: currentPath,
                issue: 'Type mismatch',
                en: obj1[key],
                zh: obj2[key],
                enType: typeof obj1[key],
                zhType: typeof obj2[key]
            });
        }
    }
    
    // 检查zh中是否有多余的键
    for (const key in obj2) {
        if (obj1[key] === undefined) {
            issues.push({
                path: `${path}.${key}`.slice(1),
                issue: 'Extra key in Chinese translation',
                en: undefined,
                zh: obj2[key]
            });
        }
    }
}

// 开始遍历
console.log('Checking translations...');
traverse(en, zh);

// 输出结果
if (issues.length === 0) {
    console.log('No issues found!');
} else {
    console.log(`Found ${issues.length} issues:`);
    console.log('='.repeat(100));
    
    issues.forEach((issue, index) => {
        console.log(`\n${index + 1}. Path: ${issue.path}`);
        console.log(`   Issue: ${issue.issue}`);
        if (issue.en !== undefined) console.log(`   EN: ${issue.en}`);
        if (issue.zh !== undefined) console.log(`   ZH: ${issue.zh}`);
        if (issue.enPlaceholders) console.log(`   EN Placeholders: [${issue.enPlaceholders.join(', ')}]`);
        if (issue.zhPlaceholders) console.log(`   ZH Placeholders: [${issue.zhPlaceholders.join(', ')}]`);
        if (issue.enType) console.log(`   EN Type: ${issue.enType}, ZH Type: ${issue.zhType}`);
        console.log('-'.repeat(100));
    });
    
    console.log(`\nTotal issues: ${issues.length}`);
}
