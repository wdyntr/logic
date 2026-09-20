import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { appendList, arrayList, bubbleSort, deleteList, dequeue, display, displayDB, enqueue, findList, peek, popStack, prependList, pushStack, sizeList, snapshot, top } from "../controllers/dsa.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
// hash map
router.post("/", asyncHandler(display));
router.get("/", authenticate, asyncHandler(displayDB));
// queue
router.post("/queue", asyncHandler(enqueue));
router.post("/dequeue", asyncHandler(dequeue));
router.get("/peek", asyncHandler(peek));
// stack
router.post("/push", asyncHandler(pushStack));
router.post("/pop", asyncHandler(popStack));
router.get("/top", asyncHandler(top));
router.get("/snapshot", asyncHandler(snapshot));
// linked list
router.post('/append', asyncHandler(appendList))
router.post('/prepend', asyncHandler(prependList))
router.post('/drop', asyncHandler(deleteList))
router.post('/find', asyncHandler(findList))
router.get('/toArray', asyncHandler(arrayList))
router.get('/size', asyncHandler(sizeList))
// bubble sort
router.post('/sort/bubble', asyncHandler(bubbleSort))
router.post('/sort/selection', asyncHandler(bubbleSort))
export default router;