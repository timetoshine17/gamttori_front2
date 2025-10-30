import {create} from 'zustand'

const currentAppZustand = create((set) => ({
	currentApp:'',
	setCurrentApp: (type) => set({currentApp:type}),
}))

export default currentAppZustand;