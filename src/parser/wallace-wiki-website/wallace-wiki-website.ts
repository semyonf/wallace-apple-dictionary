import axios from 'axios';

export class WallaceWikiWebsite {
  constructor(
    private readonly baseURL: string,
    private readonly _axiosInstance = axios.create({
      baseURL,
      timeout: 5000,
    }),
  ) {}
}
