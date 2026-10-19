// A creator returning through their own invite still needs the start controls.
// Administrators visiting another account's invite remain ordinary players.
export function roomHostControls(kind, authenticated, room) {
  return (
    !!authenticated &&
    !!room?.canManage &&
    (kind === "host" || (kind === "join" && room.isCreator === true))
  );
}
