// type SidebarProps =
//   | {
//       role: "admin"
//       view: AdminView
//       setView: (view: AdminView) => void
//     }
//   | {
//       role: "shipper"
//       view: ShipperView
//       setView: (view: ShipperView) => void
//     }

export type AdminView = 'rates'
export type ShipperView = 'new' | 'history'