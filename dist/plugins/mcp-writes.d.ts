import { supportsVerifiedWrites } from '../document-write.js';
import type { MCPProviderContext } from '../types/plugins/mcp-provider.js';
import type { UttoriWikiDocument } from '../wiki.js';
/** Tool descriptors advertised only to authenticated HTTP writers. */
export declare const writeTools: ({
    name: string;
    description: string;
    inputSchema: {
        type: 'object';
        additionalProperties: boolean;
        required: string[];
        properties: {
            slug: {
                type: string;
            };
            changes?: undefined;
            previewId?: undefined;
        };
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: 'object';
        additionalProperties: boolean;
        required: string[];
        properties: {
            slug?: undefined;
            changes: {
                type: string;
                minItems: number;
                maxItems: number;
                items: {
                    type: string;
                    additionalProperties: boolean;
                    required: string[];
                    properties: {
                        slug: {
                            type: string;
                        };
                        expectedVersion: {
                            type: string[];
                            description: string;
                        };
                        title: {
                            type: string;
                            description: string;
                        };
                        content: {
                            type: string;
                        };
                        excerpt: {
                            type: string;
                        };
                        tags: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                        metadata: {
                            type: string;
                            description: string;
                        };
                    };
                };
            };
            previewId?: undefined;
        };
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: 'object';
        additionalProperties: boolean;
        required: string[];
        properties: {
            slug?: undefined;
            changes?: undefined;
            previewId: {
                type: string;
            };
        };
    };
})[];
/** Review a link-safe move without exposing a generic delete operation. */
export declare const refactorTool: {
    name: string;
    description: string;
    inputSchema: {
        type: 'object';
        additionalProperties: boolean;
        required: string[];
        properties: {
            mode: {
                type: string;
                enum: string[];
            };
            from: {
                type: string;
            };
            to: {
                type: string;
            };
            expectedSourceVersion: {
                type: string;
            };
            expectedTargetVersion: {
                type: string[];
            };
            resumePreviewId: {
                type: string;
                description: string;
            };
        };
    };
};
/**
 * @param context The active wiki.
 * @returns Whether verified retirement is supported by its storage.
 */
export declare function supportsRefactors(context: MCPProviderContext): boolean;
export { supportsVerifiedWrites as supportsWrites };
/**
 * Execute an authenticated write tool. The caller authenticates on every HTTP request.
 * @param name One of the write tool names.
 * @param args Untrusted MCP arguments.
 * @param context The wiki providing storage and search.
 * @param principal Verified caller identity, used to bind previews.
 * @returns Preview, edit snapshot, or apply receipt.
 */
export declare function callWriteTool(name: string, args: Record<string, unknown>, context: MCPProviderContext, principal: string): Promise<{
    document: UttoriWikiDocument | null;
    version: string | null;
} | {
    changes?: undefined;
    previewId?: undefined;
    error: string;
    conflicts: unknown[];
    retire?: undefined;
    expiresAt?: undefined;
} | {
    error?: undefined;
    previewId: `${string}-${string}-${string}-${string}-${string}`;
    expiresAt: number;
    changes: {
        slug: string;
        expectedVersion: string | null;
        before: {
            [k: string]: {} | null;
        } | null;
        after: Record<string, unknown>;
    }[];
    retire: {
        slug: unknown;
        redirectTo: unknown;
        expectedVersion: string;
    };
    conflicts?: undefined;
} | {
    error?: undefined;
    retire?: undefined;
    previewId: `${string}-${string}-${string}-${string}-${string}`;
    expiresAt: number;
    changes: {
        slug: string;
        expectedVersion: string | null;
        before: {
            [k: string]: {} | null;
        } | null;
        after: Record<string, unknown>;
    }[];
    conflicts?: undefined;
} | {
    changes?: undefined;
    previewId?: undefined;
    pages: {
        slug: string;
        status: string;
        revision: string | undefined;
        version: string | undefined;
        pending?: string | undefined;
    }[];
    retirement?: undefined;
    error?: undefined;
    retire?: undefined;
    expiresAt?: undefined;
    status: string;
    conflicts?: undefined;
} | {
    changes?: undefined;
    previewId?: undefined;
    pages: {
        slug: string;
        status: string;
        revision: string | undefined;
        version: string | undefined;
        pending?: string | undefined;
    }[];
    retirement: {
        slug: string;
        revision: string | undefined;
        status: string;
        pending: string | undefined;
    };
    error?: undefined;
    retire?: undefined;
    expiresAt?: undefined;
    status: string;
    conflicts?: undefined;
} | {
    changes?: undefined;
    previewId?: undefined;
    pages: {
        slug: string;
        status: string;
        revision: string | undefined;
        version: string | undefined;
        pending?: string | undefined;
    }[];
    retirement?: undefined;
    retire?: undefined;
    expiresAt?: undefined;
    conflicts?: undefined;
    error: string;
} | {
    changes?: undefined;
    previewId?: undefined;
    pages: {
        slug: string;
        status: string;
        revision: string | undefined;
        version: string | undefined;
        pending?: string | undefined;
    }[];
    retirement: {
        slug: string;
        revision: string | undefined;
        status: string;
        pending: string | undefined;
    };
    retire?: undefined;
    expiresAt?: undefined;
    conflicts?: undefined;
    error: string;
}>;
//# sourceMappingURL=mcp-writes.d.ts.map