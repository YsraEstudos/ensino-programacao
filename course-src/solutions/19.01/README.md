# Referência 19.01

`Flags<User>` expande para `{ id: boolean; name: boolean; active: boolean }`. O mapped type atua no checker e não emite um loop JavaScript. Mapeamentos homomórficos podem preservar `readonly` e `?` da fonte; este `User` não tem esses modificadores.
