local config = loadstring(game:HttpGet("https://raw.githubusercontent.com/Dzgak/Loader/main/raw/config.lua"))()

local function createEnv()
    local env = {
        loadgit = function(path)
            if path:sub(1, 2) == "@/" then
                return loadstring(game:HttpGet(config.github.raw_base .. "/libs/" .. path:sub(3)))()
            end
            return loadstring(game:HttpGet(path))()
        end,
    }
    
    local protectedEnv = setmetatable(env, {
        __index = getfenv(0),
        __metatable = "Protected",
    })
    
    return protectedEnv
end

local function loadScript(scriptInfo)
    local success, content = pcall(function()
        return game:HttpGet(config.github.raw_base .. "/" .. scriptInfo.path)
    end)
    
    if success then
        local env = createEnv()
        local func = loadstring(content)
        setfenv(func, env)
        return pcall(func)
    end
    return false, "Failed to load script: " .. scriptInfo.path
end

local function init()
    local registry = loadstring(game:HttpGet(config.github.raw_base .. "/registry.lua"))()
    local placeId = game.PlaceId
    local gameId = game.GameId
    
    for _, scriptInfo in ipairs(registry.scripts) do
        if (scriptInfo.placeIds and table.find(scriptInfo.placeIds, placeId)) or
           (scriptInfo.gameId and scriptInfo.gameId == gameId) then
            loadScript(scriptInfo)
        end
    end
end

init()
