import { eventHandler } from "h3";
import { clearStudioUserSession } from "../../utils/session.js";
export default eventHandler(async (event) => {
  return await clearStudioUserSession(event);
});
