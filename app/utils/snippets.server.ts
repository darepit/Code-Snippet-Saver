import { prisma } from "./prisma.server";
import { SnippetStyle, Prisma } from "@prisma/client";

export const createSnippet = async (title:string,
  message: string,
  userId: string,
  recipientId: string,
  style: SnippetStyle
) => {
  await prisma.snippet.create({
    data: {
      title,
      message,
      author: {
        connect: {
          id: userId,
        },
      },
      recipient: {
        connect: {
          id: recipientId,
        },
      },
      style,
    },
  });
};

export const getFilteredSnippets = async (
  userId: string,
  sortFilter: Prisma.SnippetOrderByWithRelationInput,
  whereFilter: Prisma.SnippetWhereInput
) => {
  return await prisma.snippet.findMany({
    select: {
      id: true,
      style: true,
      message: true,
      title:true,
      author: {
        select: {
          profile: true,
        },
      },
    },
    orderBy: {
      ...sortFilter,
    },
    where: {
      recipientId: userId,
      ...whereFilter,
    },
  });
};

export const getRecentSnippets = async () => {
  return await prisma.snippet.findMany({
    take: 3,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      style: {
        select: {
          lang: true,
        },
      },
      recipient: {
        select: {
          id: true,
          profile: true,
        },
      },
    },
  });
};


export const deleteSnippet = async (id: string) => {
  await prisma.user.delete({ where: { id } });
};


export const getSnippetById = async (userId: string) => {
  return await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
};