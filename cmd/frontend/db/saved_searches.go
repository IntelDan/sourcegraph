package db

import (
	"context"
	"strings"

	"github.com/keegancsmith/sqlf"
	"github.com/sourcegraph/sourcegraph/pkg/api"
	"github.com/sourcegraph/sourcegraph/pkg/db/dbconn"
	"github.com/sourcegraph/sourcegraph/pkg/trace"
)

type savedSearches struct{}

func (s *savedSearches) ListAll(ctx context.Context) (_ []api.SavedQuerySpecAndConfig, err error) {
	if Mocks.SavedSearches.ListAll != nil {
		return Mocks.SavedSearches.ListAll(ctx)
	}

	tr, ctx := trace.New(ctx, "db.SavedSearches.ListAll", "")
	defer func() {
		tr.SetError(err)
		tr.Finish()
	}()

	q := sqlf.Sprintf(`SELECT id, description, query, notify_owner, notify_slack, owner_kind, user_id, org_id FROM saved_searches`)
	rows, err := dbconn.Global.QueryContext(ctx, q.Query(sqlf.PostgresBindVar))
	if err != nil {
		return nil, err
	}
	var savedQueries []api.SavedQuerySpecAndConfig
	for rows.Next() {
		var sq api.SavedQuerySpecAndConfig
		if err := rows.Scan(&sq.Config.Key, &sq.Config.Description, &sq.Config.Query, &sq.Config.Notify, &sq.Config.NotifySlack, &sq.Config.OwnerKind, &sq.Config.UserID, &sq.Config.OrgID); err != nil {
			return nil, err
		}
		sq.Spec.Key = sq.Config.Key
		if sq.Config.OwnerKind == "user" {
			sq.Spec.Subject.User = sq.Config.UserID
		} else if sq.Config.OwnerKind == "org" {
			sq.Spec.Subject.Org = sq.Config.OrgID
		}
		savedQueries = append(savedQueries, sq)
	}
	return savedQueries, nil
}

func (s *savedSearches) Create(ctx context.Context, description string, query string, notify bool, notifySlack bool, ownerKind string, userID *int32, orgID *int32) (savedQuery *api.ConfigSavedQuery, err error) {
	if Mocks.SavedSearches.Create != nil {
		return Mocks.SavedSearches.Create(ctx, description, query, notify, notifySlack, ownerKind, userID, orgID)
	}

	tr, ctx := trace.New(ctx, "db.SavedSearches.Create", "")
	defer func() {
		tr.SetError(err)
		tr.Finish()
	}()

	savedQuery = &api.ConfigSavedQuery{
		Description: description,
		Query:       query,
		Notify:      notify,
		NotifySlack: notifySlack,
		OwnerKind:   ownerKind,
		UserID:      userID,
		OrgID:       orgID,
	}

	if err := dbconn.Global.QueryRowContext(ctx, `INSERT INTO saved_searches(description, query, notify_owner, notify_slack, owner_kind, user_id, org_id) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id`, description, query, notify, notifySlack, strings.ToLower(ownerKind), userID, orgID).Scan(&savedQuery.Key); err != nil {
		return nil, err
	}
	return savedQuery, nil
}

func (s *savedSearches) Update(ctx context.Context, id string, description string, query string, notify bool, notifySlack bool, ownerKind string, userID *int32, orgID *int32) (savedQuery *api.ConfigSavedQuery, err error) {
	if Mocks.SavedSearches.Update != nil {
		return Mocks.SavedSearches.Update(ctx, id, description, query, notify, notifySlack, ownerKind, userID, orgID)
	}

	tr, ctx := trace.New(ctx, "db.SavedSearches.Update", "")
	defer func() {
		tr.SetError(err)
		tr.Finish()
	}()

	savedQuery = &api.ConfigSavedQuery{
		Description: description,
		Query:       query,
		Notify:      notify,
		NotifySlack: notifySlack,
		OwnerKind:   ownerKind,
		UserID:      userID,
		OrgID:       orgID,
	}

	fieldUpdates := []*sqlf.Query{
		sqlf.Sprintf("updated_at=now()"),
		sqlf.Sprintf("description=%s", description),
		sqlf.Sprintf("query=%s", query),
		sqlf.Sprintf("notify_owner=%t", notify),
		sqlf.Sprintf("notify_slack=%t", notifySlack),
		sqlf.Sprintf("owner_kind=%s", strings.ToLower(ownerKind)),
		sqlf.Sprintf("user_id=%v", userID),
		sqlf.Sprintf("org_id=%v", orgID),
	}

	updateQuery := sqlf.Sprintf(`UPDATE saved_searches SET %s WHERE ID=%v RETURNING id`, sqlf.Join(fieldUpdates, ", "), id)
	if err := dbconn.Global.QueryRowContext(ctx, updateQuery.Query(sqlf.PostgresBindVar), updateQuery.Args()...).Scan(&savedQuery.Key); err != nil {
		return nil, err
	}
	return savedQuery, nil
}

func (s *savedSearches) Delete(ctx context.Context, id string) (err error) {
	if Mocks.SavedSearches.Delete != nil {
		return Mocks.SavedSearches.Delete(ctx, id)
	}

	tr, ctx := trace.New(ctx, "db.SavedSearches.Delete", "")
	defer func() {
		tr.SetError(err)
		tr.Finish()
	}()
	_, err = dbconn.Global.ExecContext(ctx, `DELETE FROM saved_searches WHERE ID=$1`, id)
	if err != nil {
		return err
	}
	return nil
}