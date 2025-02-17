export interface ScriptInfo {
    placeIds?: number[];
    gameId?: number;
    path: string;
    name: string;
}

export interface ScriptRegistry {
    scripts: ScriptInfo[];
}
