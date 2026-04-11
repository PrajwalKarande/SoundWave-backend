import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { playlistCreateSchema } from "../validators/schemas.js";
import { addSongToPlaylist, createPlaylist, deletePlaylist, deleteSongFromPlaylist, getPlaylistById, getUserPlaylists, updatePlaylist } from "../controllers/playlistController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router()

router.get('/',authenticate,getUserPlaylists)
router.get('/:id',authenticate,getPlaylistById)
router.post('/',validate(playlistCreateSchema),authenticate,createPlaylist)
router.put('/:id',authenticate,updatePlaylist)
router.delete('/:id',authenticate,deletePlaylist)
router.post('/:id/add',authenticate,addSongToPlaylist)
router.delete('/:id/remove',authenticate,deleteSongFromPlaylist)

export default router