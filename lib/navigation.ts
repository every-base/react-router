import { type Location } from './history'

enum NavigateAction {
  Push = "PUSH",
  Replace = "REPLACE",
  Pop = "POP",
}

interface NavigateEvent {
  action: NavigateAction
  location: Location
  delta: number
}

type NavigateListener = (event: NavigateEvent) => void

type NavigateParameters = 
  | [NavigateAction.Push | NavigateAction.Replace, string]
  | [NavigateAction.Pop, number] 

export interface Navigation {
  register:(listener: NavigateListener) => () => void
  listen: (listener:  NavigateListener) => () => void
  unlisten: (listener:  NavigateListener) => void
  push: <T extends string>(to: T) => void
  replace: <T extends string>(to: T) => void
  go: (delta: number) => void
  back: () => void
  forward: () => void
}

export function createNavigation(history: History): Navigation {
  const listeners: Set<NavigateListener> = new Set()
  let idx = history.state?.idx || 0

  function register(callback: NavigateListener) {
    const unlisten = listen(callback)
    window.addEventListener('popstate', onPopstate)
   
    return () => {
      unlisten()
      window.removeEventListener('popstate', onPopstate)
    }
  }

  function onPopstate() {
    notify(NavigateAction.Pop)
  }

  function listen(listener: NavigateListener) {
    listeners.add(listener)
    return () => unlisten(listener)
  }

  function unlisten(listener: NavigateListener) {
    listeners.delete(listener)
  }
  
  function push<T extends string>(to: T) {
    navigate(NavigateAction.Push, to)
  }

  function replace<T extends string>(to: T) {
    navigate(NavigateAction.Replace, to)
  }

  function go(delta: number) {
    navigate(NavigateAction.Pop, delta)
  }

  function back() {
    go(-1)
  }

  function forward() {
    go(1)
  }

  function navigate(...params: NavigateParameters) {
    const [action, to] = params

    switch(action) {
      case NavigateAction.Push:
        history.pushState({ idx: idx + 1 }, "", to)
        break
      case NavigateAction.Replace:
        history.replaceState({ idx }, "", to)
        break
      case NavigateAction.Pop:
        history.go(to)
        return
    }

    notify(action)
  }

  function notify(action: NavigateAction) {
    const { pathname, search, hash } = window.location
    const currIdx = history.state?.idx || 0
    const location = { pathname, search, hash }
    const delta = currIdx - idx
    const event = { action, location, delta }

    for (const listener of listeners) {
      listener(event)
    }

    idx = currIdx
  }

  return {
    register,
    listen,
    unlisten,
    push,
    replace,
    go,
    back,
    forward
  }
}