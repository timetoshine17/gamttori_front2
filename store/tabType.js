import {create} from 'zustand'

const tabTypeZustand = create((set) => ({
	tabType:'Home',
	setTabType: (type) => set({tabType:type}),
}))

export default tabTypeZustand;