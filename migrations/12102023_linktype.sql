ALTER TABLE research_links
ADD COLUMN link_type VARCHAR(100);

ALTER TABLE research_links
ADD COLUMN list_order integer;

ALTER TABLE research_notations
ADD COLUMN list_order integer

ALTER TABLE research_interests
ADD COLUMN list_order integer

