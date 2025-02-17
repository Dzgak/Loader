import * as fs from 'fs';
import * as path from 'path';
import { ScriptInfo, ScriptRegistry } from './types/ScriptInfo';

const SCRIPTS_DIR = path.join(__dirname, '../raw/scripts');

function extractScriptInfo(content: string): Partial<ScriptInfo> {
    const info: Partial<ScriptInfo> = {};
    
    // Parse place IDs
    const placeIdMatch = content.match(/--\s*PlaceID's?\s*:\s*([0-9,\s]+)/i);
    if (placeIdMatch) {
        info.placeIds = placeIdMatch[1].split(',').map(id => parseInt(id.trim()));
    }
    
    // Parse game ID
    const gameIdMatch = content.match(/--\s*GameID\s*:\s*(\d+)/i);
    if (gameIdMatch) {
        info.gameId = parseInt(gameIdMatch[1]);
    }
    
    return info;
}

function toLuaString(value: any, indent = ''): string {
    if (Array.isArray(value)) {
        const items = value.map(item => toLuaString(item)).join(', ');
        return `{ ${items} }`;
    }
    
    if (typeof value === 'object' && value !== null) {
        const nextIndent = indent + '    ';
        const items = Object.entries(value)
            .filter(([_, v]) => v !== undefined)
            .map(([k, v]) => `${nextIndent}${k} = ${toLuaString(v, nextIndent)}`)
            .join(',\n');
        return `{\n${items}\n${indent}}`;
    }
    
    if (typeof value === 'string') {
        return `'${value}'`;
    }
    
    return String(value);
}

function generateRegistry(): void {
    const registry: ScriptRegistry = { scripts: [] };
    
    function scanDirectory(dir: string): void {
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                scanDirectory(fullPath);
            } else if (file.endsWith('.lua')) {
                const content = fs.readFileSync(fullPath, 'utf-8');
                const relativePath = path.relative(path.join(__dirname, '../raw'), fullPath)
                    .replace(/\\/g, '/');
                
                const scriptInfo = extractScriptInfo(content);
                
                if (scriptInfo.placeIds || scriptInfo.gameId) {
                    registry.scripts.push({
                        ...scriptInfo,
                        path: relativePath,
                        name: path.basename(file, '.lua')
                    } as ScriptInfo);
                }
            }
        }
    }
    
    scanDirectory(SCRIPTS_DIR);
    
    // Generate Lua table string
    const output = `return {\n    scripts = ${toLuaString(registry.scripts, '    ')}\n}`;
    
    fs.writeFileSync(
        path.join(__dirname, '../raw/registry.lua'),
        output,
        'utf8'
    );
    
    console.log('Registry generated with:', registry.scripts.length, 'scripts');
}

generateRegistry();
