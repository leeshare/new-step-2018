import React from 'react';
import PDF from 'react-pdf-js';
import { Card, Row, Col, Progress, Button, Icon, Modal } from 'antd'
import './PDFViewer.less';
//props.callback(currentPage,Pages)
//props.startPage
//props.lecture_info.media_info.media_url
class PDFViewer extends React.Component {
  state = {};

  onDocumentComplete = (pages) => {
    this.setState({ page: this.props.startPage || 1, pages });
  }

  onPageComplete = (page) => {
    this.setState({ page });
  }

  handlePrevious = () => {
    this.setState({ page: this.state.page - 1 });
  }

  handleNext = () => {
    this.setState({ page: this.state.page + 1 });
    //回传文档学习进度
    if (this.props.callbak) {
      this.props.callbak(this.state.page + 1, this.state.pages);
    }
  }

  renderPagination = (page, pages) => {
    return <div className="pager">
      {page>1?<div className="preBtn" onClick={this.handlePrevious}><Icon type="left-circle" /></div>:''}
      {page<pages?<div className="nextBtn" onClick={this.handleNext}><Icon type="right-circle" /></div>:''}
      <div className='pages'>
        {page}/{pages}
      </div>
    </div>;
  }

  render() {
    let pagination = null;
    if (this.state.pages) {
      pagination = this.renderPagination(this.state.page, this.state.pages);
    }
    return (
      <div className="pdfViewer">
        <PDF file={this.props.lecture_info.media_info.media_url} onDocumentComplete={this.onDocumentComplete} onPageComplete={this.onPageComplete} page={this.state.page} />
        {pagination}
      </div>
    )
  }
}

export default PDFViewer
