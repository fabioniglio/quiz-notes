import { atom } from 'jotai'

export const isSelectModeAtom = atom(false)
export const selectedQuizIdsAtom = atom<Set<string>>(new Set<string>())
