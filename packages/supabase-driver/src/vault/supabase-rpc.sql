create or replace function create_secret(plaintext text) returns text as $$
  select vault.create_secret(plaintext);
$$ language sql;

create or replace function decrypt_secret(secret_id uuid) returns text as $$
  select decrypted_secret
  from vault.decrypted_secrets
  where id = secret_id;
$$ language sql;
