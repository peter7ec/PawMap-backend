import { Server as SocketServer, Socket } from "socket.io";
import { prisma, redis } from "@backend/database";

export type CommentTargetType = "location" | "event";

export type CommentMessage = {
  targetType: CommentTargetType;
  targetId: string;
  userId: string;
  content: string;
  parentId?: string | null;
};

const roomForTarget = (type: CommentTargetType, id: string) =>
  `comment:${type}:${id}`;

function makeReply(ack?: (res: { ok: boolean; error?: string }) => void) {
  let sent = false;
  return (res: { ok: boolean; error?: string }) => {
    if (sent) return;
    sent = true;
    try {
      ack?.(res);
    } catch {}
  };
}

export const setupSocketHandlers = (io: SocketServer) => {
  io.on("connection", (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on(
      "comment:subscribe",
      (data: { targetType: CommentTargetType; targetId: string }) => {
        if (!data?.targetType || !data?.targetId) return;
        socket.join(roomForTarget(data.targetType, data.targetId));
        console.log(
          `Socket ${socket.id} joined room ${roomForTarget(
            data.targetType,
            data.targetId
          )}`
        );
      }
    );

    socket.on(
      "comment:unsubscribe",
      (data: { targetType: CommentTargetType; targetId: string }) => {
        if (!data?.targetType || !data?.targetId) return;
        socket.leave(roomForTarget(data.targetType, data.targetId));
        console.log(
          `Socket ${socket.id} left room ${roomForTarget(
            data.targetType,
            data.targetId
          )}`
        );
      }
    );

    socket.on(
      "comment:create",
      async (
        data: CommentMessage,
        ack?: (res: { ok: boolean; error?: string }) => void
      ) => {
        const reply = makeReply(ack);
        try {
          const content = data?.content?.trim();
          if (
            !data?.targetType ||
            !data?.targetId ||
            !data?.userId ||
            !content
          ) {
            reply({ ok: false, error: "Validation error" });
            return;
          }

          const saved = await prisma.comment.create({
            data: {
              content,
              userId: data.userId,
              locationId:
                data.targetType === "location" ? data.targetId : undefined,
              eventId: data.targetType === "event" ? data.targetId : undefined,
              parentId: data.parentId ?? null,
            },
            include: {
              user: { select: { id: true, name: true, profile_avatar: true } },
            },
          });

          const payload = {
            id: saved.id,
            targetType: data.targetType,
            targetId: data.targetId,
            userId: saved.userId,
            content: saved.content,
            parentId: saved.parentId ?? null,
            createdAt: saved.createdAt.toISOString(),
            socketId: socket.id,
            user: {
              id: saved.user.id,
              name: saved.user.name,
              profile_avatar: saved.user.profile_avatar,
            },
          };

          io.to(roomForTarget(data.targetType, data.targetId)).emit(
            "comment:new",
            payload
          );

          redis
            .lpush(
              `messages:${roomForTarget(data.targetType, data.targetId)}`,
              JSON.stringify(payload)
            )
            .catch((e) => console.error("redis lpush failed", e));

          reply({ ok: true });
        } catch (err) {
          console.error("comment:create error", err);
          reply({ ok: false, error: "Server error" });
        }
      }
    );

    socket.on(
      "comment:typing",
      (data: {
        targetType: CommentTargetType;
        targetId: string;
        userId: string;
      }) => {
        if (!data?.targetType || !data?.targetId || !data?.userId) return;
        socket
          .to(roomForTarget(data.targetType, data.targetId))
          .emit("comment:typing", data);
      }
    );

    socket.on(
      "comment:update",
      async (
        data: {
          id: string;
          targetType: CommentTargetType;
          targetId: string;
          userId: string;
          content: string;
        },
        ack?: (res: { ok: boolean; error?: string }) => void
      ) => {
        const reply = makeReply(ack);
        try {
          const content = data?.content?.trim();
          if (
            !data?.id ||
            !data?.targetType ||
            !data?.targetId ||
            !data?.userId ||
            !content
          ) {
            reply({ ok: false, error: "Validation error" });
            return;
          }

          const existing = await prisma.comment.findUnique({
            where: { id: data.id },
          });
          if (!existing || existing.userId !== data.userId) {
            reply({ ok: false, error: "Forbidden" });
            return;
          }

          const updated = await prisma.comment.update({
            where: { id: data.id },
            data: { content },
            include: {
              user: { select: { id: true, name: true, profile_avatar: true } },
            },
          });

          const payload = {
            id: updated.id,
            targetType: data.targetType,
            targetId: data.targetId,
            userId: updated.userId,
            content: updated.content,
            parentId: updated.parentId ?? null,
            createdAt: updated.createdAt.toISOString(),
            user: {
              id: updated.user.id,
              name: updated.user.name,
              profile_avatar: updated.user.profile_avatar,
            },
          };

          io.to(roomForTarget(data.targetType, data.targetId)).emit(
            "comment:updated",
            payload
          );
          reply({ ok: true });
        } catch (e) {
          console.error("comment:update error", e);
          reply({ ok: false, error: "Server error" });
        }
      }
    );

    socket.on(
      "comment:delete",
      async (
        data: {
          id: string;
          targetType: CommentTargetType;
          targetId: string;
          userId: string;
        },
        ack?: (res: { ok: boolean; error?: string }) => void
      ) => {
        const reply = makeReply(ack);
        try {
          if (
            !data?.id ||
            !data?.targetType ||
            !data?.targetId ||
            !data?.userId
          ) {
            reply({ ok: false, error: "Validation error" });
            return;
          }

          const existing = await prisma.comment.findUnique({
            where: { id: data.id },
          });
          if (!existing || existing.userId !== data.userId) {
            reply({ ok: false, error: "Forbidden" });
            return;
          }

          await prisma.comment.delete({ where: { id: data.id } });

          io.to(roomForTarget(data.targetType, data.targetId)).emit(
            "comment:deleted",
            {
              id: data.id,
              targetType: data.targetType,
              targetId: data.targetId,
            }
          );
          reply({ ok: true });
        } catch (e) {
          console.error("comment:delete error", e);
          reply({ ok: false, error: "Server error" });
        }
      }
    );

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  io.of("/").adapter.on("join-room", (_room, _id) => {});
};
