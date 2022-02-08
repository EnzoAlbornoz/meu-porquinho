export type If<T, V, F> = T extends true ? V : F;

export type Overwrite<O, K extends keyof O, V> = Omit<O, K> & {
    [F in K]: V;
};

export type WithMeta<P, Serialize extends boolean = false> = P & {
    meta: {
        createdAt: If<Serialize, string, Date>;
        updatedAt: If<Serialize, string, Date>;
        deletedAt: If<Serialize, string, Date> | null;
    };
};

export type WithPublicMeta<P, Serialize extends boolean = false> = P & {
    meta: {
        createdAt: If<Serialize, string, Date>;
        updatedAt: If<Serialize, string, Date>;
    };
};
