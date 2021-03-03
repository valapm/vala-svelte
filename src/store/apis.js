import { asyncReadable } from "svelte-async-readable"
import { fetchMattercloudKey } from "../apis/mattercloud"

export const mattercloudKey = asyncReadable({
  dataProvider: fetchMattercloudKey,
  initialValue: null
})
