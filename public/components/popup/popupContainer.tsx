import React, { useState, useEffect, useCallback } from 'react'
import classNames from 'classnames'
import { getStorage } from 'vc-cake'
import VotePopup from './popups/votePopup'
import ReviewPopup from './popups/reviewPopup'
import DataCollectionPopup from './popups/dataCollectionPopup'
import PremiumPromoPopup from './popups/premiumPromoPopup'
import PricingPopup from './popups/pricingPopup'
import { connect } from 'react-redux'
import { allPopupsHidden, popupVisibilitySet } from '../../editor/stores/editorPopup/slice'
import { AppStateType } from "../../editor/stores/reducer"
import { Dispatch } from 'redux'

const elementsStorage = getStorage('elements')

type Props = {
  activePopup: string,
  allPopupsHidden: () => void,
  isPopupVisible: boolean,
  popupVisibilitySet: (status:boolean) => void,
}

const PopupContainer: React.FC<Props> = ({ activePopup, allPopupsHidden, isPopupVisible, popupVisibilitySet }) => {
  const [actionClicked, setActionClicked] = useState(false)

  const handleDocumentChange = useCallback((data:[]) => {
    if (data && data.length) {
      window.setTimeout(() => {
        popupVisibilitySet(!!activePopup)
        elementsStorage.state('document').ignoreChange(handleDocumentChange)
      }, activePopup === 'pricingPopup' ? 20000 : 500)
    }
  }, [activePopup]);

  useEffect(() => {
    elementsStorage.state('document').onChange(handleDocumentChange)
    return () => {
      elementsStorage.state('document').ignoreChange(handleDocumentChange)
    }
  }, [handleDocumentChange])


  const handleCloseClick = () => {
      popupVisibilitySet(false)
      window.setTimeout(() => {
      allPopupsHidden()
    }, 500)
  }

  const handlePrimaryButtonClick = () => {
    setActionClicked(true)
    window.setTimeout(() => {
      setActionClicked(false)
        popupVisibilitySet(false);
        allPopupsHidden()
    }, 500)
  }

  const popupClasses = classNames({
    'vcv-layout-popup': true,
    'vcv-layout-popup--visible': isPopupVisible,
    'vcv-layout-popup--action-clicked': actionClicked,
    'vcv-layout-popup--pricing-popup': activePopup === 'pricingPopup'
  })

  const popupProps = {
    onClose: handleCloseClick,
    onPrimaryButtonClick: handlePrimaryButtonClick
  }

  let activePopupHtml = null

  if (activePopup === 'votePopup') {
    activePopupHtml = <VotePopup {...popupProps} />
  } else if (activePopup === 'reviewPopup') {
    activePopupHtml = <ReviewPopup {...popupProps} />
  } else if (activePopup === 'dataCollectionPopup') {
    activePopupHtml = <DataCollectionPopup {...popupProps} />
  } else if (activePopup === 'premiumPromoPopup') {
    activePopupHtml = <PremiumPromoPopup {...popupProps} />
  } else if (activePopup === 'pricingPopup') {
    activePopupHtml = <PricingPopup {...popupProps} />
  }

  return (
    <div className={popupClasses}>
      <div className='vcv-layout-popup-container'>
        {activePopupHtml}
      </div>
    </div>
  )
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  allPopupsHidden: () => dispatch(allPopupsHidden()),
  popupVisibilitySet: (data:boolean) => dispatch(popupVisibilitySet(data))
})

const mapStateToProps = (state: AppStateType) => ({
  activePopup: state.editorPopup.activePopup,
  isPopupVisible: state.editorPopup.isPopupVisible
})

export default connect(mapStateToProps, mapDispatchToProps)(PopupContainer)
