export const title = "Track progress on a topic";
export const state = (v) => ({ none: "Not marked", need_to_learn: "Need to learn", learning: "Learning", know_it: "Know it" }[v.mark]);
const words = { need_to_learn: "need to learn", learning: "learning", know_it: "know it" };
export const step = (action, from, to) =>
  to.mark === "none" ? `you press ${words[from.mark]} again` : `you press ${words[to.mark]}`;
export const group = (v) => (v.mark === "know_it" ? "known" : v.mark === "none" ? "unmarked" : "studying");
export const colors = { known: "teal", unmarked: "tan", studying: "blue" };
