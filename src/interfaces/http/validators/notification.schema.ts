import { z } from "zod";
import { idParam, paginationQuery } from "./common.js";

export const getNotificationsSchema = {
  query: paginationQuery
};

export const notificationIdSchema = {
  params: idParam
};
