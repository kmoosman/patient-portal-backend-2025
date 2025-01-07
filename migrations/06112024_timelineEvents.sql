alter table timeline_events
    alter column description type text using description::text;