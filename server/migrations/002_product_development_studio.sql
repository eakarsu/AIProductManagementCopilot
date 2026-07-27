CREATE TABLE IF NOT EXISTS product_studio_initiatives (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT,
  product_id BIGINT,
  initiative_ref TEXT NOT NULL UNIQUE,
  customer_problem TEXT NOT NULL,
  target_segment TEXT NOT NULL,
  evidence_count INTEGER NOT NULL DEFAULT 0,
  prototype_url TEXT,
  experiment_hypothesis TEXT NOT NULL,
  acceptance_criteria JSONB NOT NULL DEFAULT '[]'::jsonb,
  test_plan JSONB NOT NULL DEFAULT '[]'::jsonb,
  pull_request_url TEXT,
  accountable_owner TEXT NOT NULL,
  stage TEXT NOT NULL CHECK(stage IN ('discovery','prototype','validation','human_review','pr_ready')),
  risk TEXT NOT NULL CHECK(risk IN ('low','medium','high')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO product_studio_initiatives
  (initiative_ref,customer_problem,target_segment,evidence_count,prototype_url,experiment_hypothesis,acceptance_criteria,test_plan,pull_request_url,accountable_owner,stage,risk)
SELECT 'PDS-'||LPAD(g::text,3,'0'),
  (ARRAY['Approvals take too long','Customers cannot explain failed imports','Support cannot reproduce configuration errors','New users abandon setup','Decision owners lack outcome evidence'])[((g-1)%5)+1],
  (ARRAY['Enterprise administrators','Operations analysts','Customer support leads','New workspace owners','Product decision makers'])[((g-1)%5)+1],
  3+g,
  CASE WHEN g%5>0 THEN 'https://prototype.local/pds-'||g ELSE NULL END,
  (ARRAY['Guided approval routing reduces cycle time by 25%','A structured error brief reduces repeat contacts','Replayable configurations reduce diagnosis time','A milestone checklist improves activation','Evidence-linked decisions improve forecast accuracy'])[((g-1)%5)+1],
  jsonb_build_array('Primary task succeeds','Accessibility checks pass','No critical regression','Owner signs outcome definition'),
  jsonb_build_array('Unit and policy tests','Representative-user scenario','Failure and rollback exercise','Human approval review'),
  CASE WHEN g%5=0 THEN 'https://github.local/pull/'||g ELSE NULL END,
  (ARRAY['Maya · Product','Eli · Design','Sam · Engineering','Rin · Research','Taylor · Quality'])[((g-1)%5)+1],
  (ARRAY['discovery','prototype','validation','human_review','pr_ready'])[((g-1)%5)+1],
  (ARRAY['medium','low','high'])[((g-1)%3)+1]
FROM generate_series(1,15) g ON CONFLICT(initiative_ref) DO NOTHING;
