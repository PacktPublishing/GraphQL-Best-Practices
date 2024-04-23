import { atom } from "jotai";

export const jwtToken = atom(window.localStorage.getItem("token"))
