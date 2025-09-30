  // Reopen methods
  reopenNominations(categoryId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/categories/${categoryId}/reopen-nominations`, {}, { headers: this.getHeaders() });
  }

  reopenVoting(categoryId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/categories/${categoryId}/reopen-voting`, {}, { headers: this.getHeaders() });
  }