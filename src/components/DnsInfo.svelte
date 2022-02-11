<script>
  export let oracle
</script>

<div class="dns_info_box">
  <div class="header">
    <h2>Validate {oracle.oracleStateByCurrentstateid.domain}</h2>
  </div>
  <div class="body">
    <p>
      To validate your domain name, please add the following DNS TXT record to your domain. This can be done in the
      control panel of your domain name registrar.
    </p>
    <div class="warning">It can take up to a day for DNS changes to update.</div>
    <div class="dns_entry">
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Host Name</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>TXT</td>
            <td>@</td>
            <td class="entry_value">vala:oracle:{oracle.pubKey}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

<style>
  .dns_info_box {
    width: min(90vw, 35rem);
    overflow: hidden;
    border-radius: 0.375rem;
    border: 1px solid #60616d;
  }

  p {
    white-space: normal;
    width: 100%;
  }

  .header,
  .body {
    padding: 1rem;
  }

  h2 {
    font-weight: 500;
  }

  .header {
    background-color: #323841;
    border-bottom: 1px solid #60616d;
  }

  .body {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
  }

  .warning {
    color: #dca52a;
    border: 1px solid #dca52a;
    border-radius: 0.375rem;
    padding: 0.625rem;
  }

  .dns_entry {
    width: 100%;
    overflow: hidden;
  }

  table {
    border-collapse: unset;
    /* table-layout: fixed; */
    width: 100%;
  }

  th {
    white-space: nowrap;
    text-align: left;
  }

  td,
  th {
    padding: 0.5rem;
  }

  tbody tr {
    outline: 1px solid #60616d;
    border-radius: 0.375rem;
    width: 100%;
  }

  td:nth-child(1) {
    width: 10%;
  }

  td:nth-child(2) {
    width: 20%;
  }

  .entry_value {
    /* word-break: break-all; */
    width: 70%;
    max-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
