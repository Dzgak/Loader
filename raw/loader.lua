local config = loadstring(game:HttpGet("https://raw.githubusercontent.com/Dzgak/Loader/main/raw/config.lua"))()

local function loadScript(scriptInfo)
    local success, content = pcall(function()
        return game:HttpGet(config.github.raw_base .. "/" .. scriptInfo.path)
    end)
    
    if success and content then
        local func, err = loadstring(content)
        if func then
            local execSuccess, execErr = pcall(func)
            if not execSuccess then
                warn("Error executing script:", execErr)
            end
            return execSuccess, execErr
        else
            warn("Failed to compile script:", err)
            warn(config.github.raw_base .. "/" .. scriptInfo.path)
            return false, "Compilation error"
        end
    else
        warn("Failed to load script:", scriptInfo.path)
        return false, "HTTP error"
    end
end

local function init()
    local success, registry = pcall(function()
        return loadstring(game:HttpGet("https://raw.githubusercontent.com/Dzgak/Loader/main/raw/registry.lua"))()
    end)
    
    if not success or type(registry) ~= "table" or not registry.scripts then
        warn("Failed to load script registry")
        return
    end
    
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
