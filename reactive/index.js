const bucket = new WeakMap();
let activeEffect;
const effectStack = [];

// 注册副作用函数
exports.effect = fn => {
    const effectFn = () => {
        cleanup(effectFn); //清除相关依赖
        activeEffect = effectFn;
        effectStack.push(effectFn);
        fn();
        effectStack.pop();
        activeEffect = effectStack[effectStack.length - 1];
    }
    effectFn.deps = [];
    effectFn();
}

// 跟踪依赖
const track = (target, key) => {
    let depMap = bucket.get(target);
    if(!depMap) {
        bucket.set(target, (depMap = new Map()));
    }

    let deps = depMap.get(key)
    if(!deps) {
        depMap.set(key, (deps = new Set()));
    }

    deps.add(activeEffect);

    activeEffect.deps.push(deps);
}

// 触发副作用函数
const trigger = (target, key) => {
    const depMap = bucket.get(target);
    if(!depMap) return;
    const effectFn = depMap.get(key);
    const effectFnToRun = new Set(effectFn); // 防止无限执行（删除依赖，副作用又添加依赖）
    effectFnToRun&&effectFnToRun.forEach(fn => fn());
}

const cleanup = effectFn => {
    for(let i = 0; i < effectFn.deps.length; i++) {
        const deps = effectFn.deps[i];
        deps.delete(effectFn);
    }
}

exports.reactive = target => {
    return new Proxy(target, {
        get: (target, key) => {
            if(!activeEffect) return
            track(target, key);
            return target[key];
        },
        set: (target, key, newVal) => {
            trigger(target, key);
            target[key] = newVal;
            return true;
        }
    })
}