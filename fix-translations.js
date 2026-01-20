import { readFileSync, writeFileSync } from 'fs';

// 读取JSON文件
const en = JSON.parse(readFileSync('d:\\github\\Termix-cn\\src\\locales\\en.json', 'utf8'));
let zh = JSON.parse(readFileSync('d:\\github\\Termix-cn\\src\\locales\\zh.json', 'utf8'));

// 修复占位符错误
const placeholderFixes = {
    'serverStats.cpuUsage': '{{usage}}',
    'serverStats.memoryUsage': '{{usage}}',
    'fileManager.itemCount': '{{count}}',
    'fileManager.selectedCount': '{{count}}',
    'fileManager.itemsDeletedSuccessfully': '{{count}}',
    'fileManager.operationCompletedSuccessfully': '{{operation}} {{count}}',
    'fileManager.operationCompleted': '{{operation}} {{count}}',
    'docker.allContainersCount': '{{count}}',
    'userManagement.confirmDeleteRoleDescription': '{{name}}',
    'userManagement.confirmDeleteUserDescription': '{{name}}',
    'accessControl.confirmDeleteRoleDescription': '{{name}}',
    'sharing.confirmRevokeAccessDescription': '{{name}}',
    'sharing.expiresInHours': '{{hours}}',
    'docker.failedToStartContainer': '{{name}}',
    'docker.failedToRestartContainer': '{{name}}',
    'docker.connectedTo': '{{containerName}}',
    'docker.connectingTo': '{{containerName}}',
    'docker.errorMessage': '{{message}}'
};

// 修复翻译错误
const translationFixes = {
    'docker.noPorts': '无端口',
    'docker.noContainersFound': '未找到容器',
    'docker.noContainersFoundHint': '本主机上没有可用的 Docker 容器',
    'docker.searchPlaceholder': '搜索容器...',
    'docker.filterByStatusPlaceholder': '按状态筛选...',
    'docker.statusCount': '{{status}} ({{count}})',
    'docker.noContainersMatchFilters': '没有容器符合您的筛选条件',
    'docker.noContainersMatchFiltersHint': '尝试调整搜索或筛选条件',
    'docker.containerMustBeRunningToViewStats': '容器必须正在运行才能查看统计信息',
    'docker.failedToFetchStats': '获取容器统计信息失败',
    'docker.containerNotRunning': '容器未运行',
    'docker.startContainerToViewStats': '启动容器以查看统计信息',
    'docker.loadingStats': '正在加载统计信息...',
    'docker.errorLoadingStats': '加载统计信息时出错',
    'docker.noStatsAvailable': '无统计数据可用',
    'docker.cpuUsage': 'CPU 使用率',
    'docker.current': '当前',
    'docker.memoryUsage': '内存使用情况',
    'docker.usedLimit': '已用/限制',
    'docker.percentage': '百分比',
    'docker.networkIo': '网络 I/O',
    'docker.input': '输入',
    'docker.output': '输出',
    'docker.blockIo': '块 I/O',
    'docker.read': '读取',
    'docker.write': '写入',
    'docker.pids': 'PID',
    'docker.containerInformation': '容器信息',
    'docker.name': '名称',
    'docker.id': 'ID',
    'docker.state': '状态',
    'docker.disconnectedFromContainer': '与容器断开连接',
    'docker.containerMustBeRunning': '容器必须正在运行才能访问控制台',
    'docker.authenticationRequired': '需要身份验证',
    'docker.verificationCodePrompt': '请输入验证码',
    'docker.totpVerificationFailed': 'TOTP验证失败，请重试。',
    'docker.connectedTo': '连接到 {{containerName}}',
    'docker.disconnected': '已断开连接',
    'docker.consoleError': '控制台错误',
    'docker.errorMessage': '错误: {{message}}',
    'docker.failedToConnect': '连接容器失败',
    'docker.console': '控制台',
    'docker.selectShell': '选择Shell',
    'docker.bash': 'Bash',
    'docker.sh': 'Sh',
    'docker.ash': 'Ash',
    'docker.connecting': '正在连接...',
    'docker.connect': '连接',
    'docker.disconnect': '断开',
    'docker.notConnected': '未连接',
    'docker.clickToConnect': '点击“连接”以启动 shell 会话',
    'docker.connectingTo': '正在连接到 {{containerName}}...',
    'docker.containerNotFound': '未找到容器',
    'docker.backToList': '返回列表',
    'docker.logs': '日志',
    'docker.stats': '统计数据',
    'docker.consoleTab': '控制台',
    'docker.startContainerToAccess': '启动容器以访问控制台'
};

// 应用占位符修复
for (const path in placeholderFixes) {
    const keys = path.split('.');
    let current = zh;
    let enCurrent = en;
    
    // 检查路径是否存在于两个文件中
    let validPath = true;
    for (const key of keys) {
        if (!current[key] || !enCurrent[key]) {
            validPath = false;
            break;
        }
        current = current[key];
        enCurrent = enCurrent[key];
    }
    
    if (!validPath) continue;
    
    // 提取占位符
    const enPlaceholders = (enCurrent.match(/\{\{([^}]+)\}\}/g) || []).map(p => p.replace(/\{\{|\}\}/g, ''));
    const zhPlaceholders = (current.match(/\{\{([^}]+)\}\}/g) || []).map(p => p.replace(/\{\{|\}\}/g, ''));
    
    // 只修复占位符名称，不改变翻译内容
    if (enPlaceholders.length === zhPlaceholders.length) {
        let fixedZh = current;
        for (let i = 0; i < enPlaceholders.length; i++) {
            fixedZh = fixedZh.replace(`{{${zhPlaceholders[i]}}}`, `{{${enPlaceholders[i]}}}`);
        }
        // 重新赋值给正确的路径
        let parent = zh;
        for (let i = 0; i < keys.length - 1; i++) {
            parent = parent[keys[i]];
        }
        parent[keys[keys.length - 1]] = fixedZh;
    }
}

// 应用翻译修复
for (const path in translationFixes) {
    const keys = path.split('.');
    let current = zh;
    
    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
            current[keys[i]] = {};
        }
        current = current[keys[i]];
    }
    
    const lastKey = keys[keys.length - 1];
    if (current[lastKey]) {
        current[lastKey] = translationFixes[path];
    }
}

// 保存修复后的JSON文件
writeFileSync('d:\\github\\Termix-cn\\src\\locales\\zh.json.fixed', JSON.stringify(zh, null, 2), 'utf8');

console.log('Translation fixes applied!');
