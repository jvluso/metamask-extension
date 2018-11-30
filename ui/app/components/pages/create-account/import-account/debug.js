const inherits = require('util').inherits
const Component = require('react').Component
const h = require('react-hyperscript')
const { withRouter } = require('react-router-dom')
const { compose } = require('recompose')
const PropTypes = require('prop-types')
const connect = require('react-redux').connect
const actions = require('../../../../actions')
const { DEFAULT_ROUTE } = require('../../../../routes')
import Button from '../../../button'

DebugImportView.contextTypes = {
  t: PropTypes.func,
}

module.exports = compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(DebugImportView)


function mapStateToProps (state) {
  return {
    error: state.appState.warning,
    firstAddress: Object.keys(state.metamask.accounts)[0],
  }
}


function mapDispatchToProps (dispatch) {
  return {
    importNewAccount: (strategy, [ privateKey ]) => {
      return dispatch(actions.importNewAccount(strategy, [ privateKey ]))
    },
    displayWarning: (message) => dispatch(actions.displayWarning(message || null)),
    setSelectedAddress: (address) => dispatch(actions.setSelectedAddress(address)),
  }
}

inherits(DebugImportView, Component)
function DebugImportView () {
  this.createKeyringOnEnter = this.createKeyringOnEnter.bind(this)
  Component.call(this)
}

DebugImportView.prototype.render = function () {
  const { error, displayWarning } = this.props

  return (
    h('div.new-account-import-form__private-key', [

      h('span.new-account-create-form__instruction', this.context.t('pasteDebugAddress')),

      h('div.new-account-import-form__debug-address-password-container', [

        h('input.new-account-import-form__input-password', {
          type: 'text',
          id: 'debug-box',
          onKeyPress: e => this.createKeyringOnEnter(e),
        }),

      ]),

      h('div.new-account-import-form__buttons', {}, [

        h(Button, {
          type: 'default',
          large: true,
          className: 'new-account-create-form__button',
          onClick: () => {
            displayWarning(null)
            this.props.history.push(DEFAULT_ROUTE)
          },
        }, [this.context.t('cancel')]),

        h(Button, {
          type: 'primary',
          large: true,
          className: 'new-account-create-form__button',
          onClick: () => this.createNewKeychain(),
        }, [this.context.t('import')]),

      ]),

      error ? h('span.error', error) : null,
    ])
  )
}

DebugImportView.prototype.createKeyringOnEnter = function (event) {
  if (event.key === 'Enter') {
    event.preventDefault()
    this.createNewKeychain()
  }
}

DebugImportView.prototype.createNewKeychain = function () {
  var opts = {}
  opts.mockAddresses = [document.getElementById('debug-box').value]
  const { importNewAccount, history, displayWarning, setSelectedAddress, firstAddress } = this.props

  importNewAccount('Debug', [ opts ])
    .then(({ selectedAddress }) => {
      if (selectedAddress) {
        history.push(DEFAULT_ROUTE)
        displayWarning(null)
      } else {
        displayWarning('Error importing account.')
        setSelectedAddress(firstAddress)
      }
    })
    .catch(err => err && displayWarning(err.message || err))
}
